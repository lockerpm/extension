import { CipherType } from 'jslib-common/enums/cipherType';
import { SecureNoteView } from 'jslib-common/models/view/secureNoteView';
import { CipherView } from 'jslib-common/models/view/cipherView';
import { LoginUriView } from 'jslib-common/models/view/loginUriView';
import { LoginView } from 'jslib-common/models/view/loginView';

import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { FolderService } from 'jslib-common/abstractions/folder.service';
import { PolicyService } from 'jslib-common/abstractions/policy.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { UserService } from 'jslib-common/abstractions/user.service';
import { TotpService } from 'jslib-common/abstractions/totp.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';
import { ConstantsService } from 'jslib-common/services/constants.service';
import { AutofillService } from '../services/abstractions/autofill.service';

import { BrowserApi } from '../browser/browserApi';

import MainBackground from './main.background';
import Requestground from './request.backgroud';

import { Utils } from 'jslib-common/misc/utils';

import { PolicyType } from 'jslib-common/enums/policyType';

import AddChangePasswordQueueMessage from './models/addChangePasswordQueueMessage';
import AddLoginQueueMessage from './models/addLoginQueueMessage';
import AddLoginRuntimeMessage from './models/addLoginRuntimeMessage';
import ChangePasswordRuntimeMessage from './models/changePasswordRuntimeMessage';
import LockedVaultPendingNotificationsItem from './models/lockedVaultPendingNotificationsItem';
import { NotificationQueueMessageType } from './models/notificationQueueMessageType';
import { CipherRequest } from 'jslib-common/models/request/cipherRequest';
import { CipherData } from 'jslib-common/models/data/cipherData';
import { CipherResponse } from 'jslib-common/models/response/cipherResponse';
export default class NotificationBackground {

  private notificationQueue: (AddLoginQueueMessage | AddChangePasswordQueueMessage | any)[] = [];

  constructor(private main: MainBackground, private autofillService: AutofillService,
    private cipherService: CipherService, private storageService: StorageService,
    private vaultTimeoutService: VaultTimeoutService, private policyService: PolicyService,
    private folderService: FolderService, private userService: UserService,
    private totpService: TotpService, private request: Requestground
  ) {}

  async init() {
    if (chrome.runtime == null) {
      return;
    }

    BrowserApi.messageListener('notification.background', async (msg: any, sender: chrome.runtime.MessageSender) => {
      await this.processMessage(msg, sender);
    });

    this.cleanupNotificationQueue();
  }

  async processMessage(msg: any, sender: chrome.runtime.MessageSender) {
    switch (msg.command) {
      case 'unlockCompleted':
        if (msg.data.target !== 'notification.background') {
          return;
        }
        await this.processMessage(msg.data.commandToRetry.msg, msg.data.commandToRetry.sender);
        break;
      case 'bgCloseNotificationBar':
        await BrowserApi.tabSendMessageData(sender.tab, 'closeNotificationBar');
        break;
      case 'bgAdjustNotificationBar':
        await BrowserApi.tabSendMessageData(sender.tab, 'adjustNotificationBar', msg.data);
        break;
      case 'bgAddLogin':
        await this.addLogin(msg.login, sender.tab);
        break;
      case 'bgChangedPassword':
        await this.changedPassword(msg.data, sender.tab);
        break;
      case 'bgAddClose':
      case 'bgChangeClose':
        this.removeTabFromNotificationQueue(sender.tab);
        break;
      case 'bgAddSave':
      case 'bgChangeSave':
        if (await this.vaultTimeoutService.isLocked()) {
          const retryMessage: LockedVaultPendingNotificationsItem = {
            commandToRetry: {
              msg: msg,
              sender: sender,
            },
            target: 'notification.background',
          };
          await BrowserApi.tabSendMessageData(sender.tab, 'addToLockedVaultPendingNotifications', retryMessage);
          await BrowserApi.tabSendMessageData(sender.tab, 'promptForLogin');
          return;
        }
        await this.saveOrUpdateCredentials(sender.tab, msg.folder);
        break;
      case 'bgNeverSave':
        await this.saveNever(sender.tab);
        break;
      case 'collectPageDetailsResponse':
        switch (msg.sender) {
          case 'notificationBar':
            const forms = this.autofillService.getFormsWithPasswordFields(msg.details);
            let passwordFields = [];
            let usernameFields = [];
            
            for (const form of forms) {
              for (const password of form.passwords) {
                passwordFields.push(password)
              }
              usernameFields.push(form.username)
            }
            await BrowserApi.tabSendMessageData(msg.tab, 'notificationBarPageDetails', {
              details: msg.details,
              forms: forms,
              passwordFields: passwordFields,
              usernameFields: usernameFields,
              isLocked: await this.vaultTimeoutService.isLocked()
            });
            chrome.storage.local.get('enableAutofill', (autofillObj: any) => {
              if (autofillObj.enableAutofill === false) return;
              // check is login page
              if (passwordFields.filter((f) => f.type === 'password').length === 1 && !passwordFields.filter((f) => f.type === 'password')[0].value) {
                this.autofillFirstPage(sender.tab);
              }
            })
            this.main.refreshBadgeAndMenu()
            break;
          default:
            break;
        }
        break;
      case 'informMenuTurnOff':
        await this.turnOffAutofill(sender.tab)
        break;
      case 'barFormChange':
        const currentTab = await BrowserApi.getTabFromCurrentWindow();
        const notificationQueueIndex = this.notificationQueue.findIndex((n) => currentTab && n.tabId === currentTab.id);
        if (notificationQueueIndex > -1) {
          this.notificationQueue[notificationQueueIndex]
          if (msg.username) {
            this.notificationQueue[notificationQueueIndex].username = msg.username;
          } else if (msg.password) {
            this.notificationQueue[notificationQueueIndex].password = msg.password
          } else if (msg.newPassword) {
            this.notificationQueue[notificationQueueIndex].newPassword = msg.newPassword
          }
        }
        break;
      case 'scanQRCode':
        if (chrome.tabs && chrome.tabs.captureVisibleTab) {
          chrome.tabs.captureVisibleTab(null, {}, function (dataUri) {
            BrowserApi.tabSendMessage(msg.tab, {
              command: 'capturedImage',
              tab: msg.tab,
              sender: dataUri
            });
          });
        } else {
          this.notificationAlert('capture_not_active')
        }
        break;
      case 'saveNewQRCode':
        let otp = null;
        let senderMessage = '';
        if (msg.sender && msg.sender.data) {
          otp = await this.totpService.getCode(msg.sender.data);
        }
        if (otp) {
          const name = msg.tab?.url?.split('/')[2]
          const notes = msg.sender.data;
          let currentOtps = await this.cipherService.getAllDecrypted();
          currentOtps = currentOtps.filter((c: any) => !c.deleted && c.type === CipherType.OTP)
          if (!!currentOtps.find((o) => o.notes === notes && o.name === name)) {
            this.notificationAlert('qr_existed')
          } else {
            await this.createNewOTP({ name: name, notes: notes })
            senderMessage = 'removeLockerWrapper';
          }
        } else {
          this.notificationAlert('qr_invalid')
        }
        BrowserApi.tabSendMessage(msg.tab, {
          command: 'addedOTP',
          tab: msg.tab,
          sender: senderMessage,
        });
        break;
      default:
        break;
    }
  }

  private async autofillFirstPage(tab: chrome.tabs.Tab) {
    try {
      if (this.cipherService && tab.url) {
        const currrentCiphers = await this.cipherService.getAllDecryptedForUrl(tab.url) || [];
        const loginCiphers = this.cipherService.sortCiphers(currrentCiphers.filter(c => c.type === CipherType.Login))
        if (loginCiphers.length > 0) {
          await this.startAutofillPage(loginCiphers[0])
        }
      }
    } catch (error) {
    }
  }

  private async startAutofillPage(cipher: CipherView) {
    this.main.loginToAutoFill = cipher;
    const tab = await BrowserApi.getTabFromCurrentWindow();
    if (tab == null) {
      return;
    }

    BrowserApi.tabSendMessage(tab, {
      command: 'collectPageDetails',
      tab: tab,
      sender: 'informMenu'
    });
  }

  async checkNotificationQueue(tab: chrome.tabs.Tab = null, loginInfo: object = null): Promise<void> {
    if (this.notificationQueue.length === 0) {
      return;
    }

    if (tab != null) {
      this.doNotificationQueueCheck(tab, loginInfo);
      return;
    }

    const currentTab = await BrowserApi.getTabFromCurrentWindow();
    if (currentTab != null) {
      this.doNotificationQueueCheck(currentTab, loginInfo);
    }
  }

  private cleanupNotificationQueue() {
    for (let i = this.notificationQueue.length - 1; i >= 0; i--) {
      if (this.notificationQueue[i].expires < new Date()) {
        this.notificationQueue.splice(i, 1);
      }
    }
    setTimeout(() => this.cleanupNotificationQueue(), 2 * 60 * 1000); // check every 2 minutes
  }

  private doNotificationQueueCheck(tab: chrome.tabs.Tab, loginInfo: object): void {
    if (tab == null) {
      return;
    }

    const tabDomain = Utils.getDomain(tab.url);
    if (tabDomain == null) {
      return;
    }
    loginInfo = {
      ...loginInfo,
      uri: tabDomain
    }
    for (let i = 0; i < this.notificationQueue.length; i++) {
      if (this.notificationQueue[i].tabId !== tab.id || this.notificationQueue[i].domain !== tabDomain) {
        continue;
      }
      if (this.notificationQueue[i].type === NotificationQueueMessageType.addLogin) {
        BrowserApi.tabSendMessageData(tab, 'openNotificationBar', {
          type: 'add',
          loginInfo,
          queueMessage: this.notificationQueue[0]
        });
      } else if (this.notificationQueue[i].type === NotificationQueueMessageType.changePassword) {
        BrowserApi.tabSendMessageData(tab, "openNotificationBar", {
          type: "change",
          loginInfo,
          queueMessage: this.notificationQueue[0]
        });
      }
      break;
    }
  }

  private removeTabFromNotificationQueue(tab: chrome.tabs.Tab) {
    for (let i = this.notificationQueue.length - 1; i >= 0; i--) {
      if (this.notificationQueue[i].tabId === tab.id) {
        this.notificationQueue.splice(i, 1);
      }
    }
  }

  private async addLogin(loginInfo: AddLoginRuntimeMessage, tab: chrome.tabs.Tab) {
    if (!await this.userService.isAuthenticated()) {
      return;
    }
    const loginDomain = Utils.getDomain(loginInfo.url);
    if (loginDomain == null) {
      return;
    }

    let normalizedUsername = loginInfo.username;
    if (normalizedUsername != null) {
      normalizedUsername = normalizedUsername.toLowerCase();
    }
    if (await this.vaultTimeoutService.isLocked()) {
      return;
    }

    const ciphers = await this.cipherService.getAllDecryptedForUrl(loginInfo.url) || [];
    const usernameMatches = ciphers.filter(c =>
      c.login.username != null && c.login.username.toLowerCase() === normalizedUsername);
    if (usernameMatches.length === 0) {
      const disabledAddLogin = await this.storageService.get<boolean>(
        ConstantsService.disableAddLoginNotificationKey);
      if (disabledAddLogin) {
        return;
      }

      if (!(await this.allowPersonalOwnership())) {
        return;
      }

      this.pushAddLoginToQueue(loginDomain, loginInfo, tab);

    } else if (usernameMatches.length >= 1 && usernameMatches[0].login.password !== loginInfo.password) {
      const disabledChangePassword = await this.storageService.get<boolean>(
        ConstantsService.disableChangedPasswordNotificationKey);
      if (disabledChangePassword) {
        return;
      }
      this.pushChangePasswordToQueue(usernameMatches[0].id, loginDomain, loginInfo.password, loginInfo.username, tab);
    }
  }

  private async pushAddLoginToQueue(loginDomain: string, loginInfo: AddLoginRuntimeMessage, tab: chrome.tabs.Tab, isVaultLocked: boolean = false) {
    // remove any old messages for this tab
    this.removeTabFromNotificationQueue(tab);
    const message: AddLoginQueueMessage = {
      type: NotificationQueueMessageType.addLogin,
      username: loginInfo.username,
      password: loginInfo.password,
      domain: loginDomain,
      uri: loginInfo.url,
      tabId: tab.id,
      expires: new Date((new Date()).getTime() + 5 * 60000), // 5 minutes
      wasVaultLocked: isVaultLocked,
    };
    this.notificationQueue.push(message);
    await this.checkNotificationQueue(tab, { username: loginInfo.username, password: loginInfo.password, uri: loginInfo.url });
  }

  private async changedPassword(changeData: ChangePasswordRuntimeMessage, tab: chrome.tabs.Tab) {
    const loginDomain = Utils.getDomain(changeData.url);
    if (loginDomain == null) {
      return;
    }

    if (await this.vaultTimeoutService.isLocked()) {
      return;
    }

    let id: string = null;
    const ciphers = await this.cipherService.getAllDecryptedForUrl(changeData.url) || [];
    if (changeData.currentPassword != null) {
      const passwordMatches = ciphers.filter(c => c.login.password === changeData.currentPassword);
      if (passwordMatches.length === 1) {
        id = passwordMatches[0].id;
      }
    } else if (ciphers.length === 1) {
      id = ciphers[0].id;
    }
    if (id != null) {
      this.pushChangePasswordToQueue(id, loginDomain, changeData.newPassword, ciphers[0].login.username, tab);
    }
  }

  private async pushChangePasswordToQueue(cipherId: string, loginDomain: string, newPassword: string, username: string, tab: chrome.tabs.Tab, isVaultLocked: boolean = false) {
    // remove any old messages for this tab
    this.removeTabFromNotificationQueue(tab);
    const message: AddChangePasswordQueueMessage = {
      type: NotificationQueueMessageType.changePassword,
      cipherId: cipherId,
      username,
      newPassword: newPassword,
      domain: loginDomain,
      tabId: tab.id,
      expires: new Date((new Date()).getTime() + 5 * 60000), // 5 minutes
      wasVaultLocked: isVaultLocked,
    };
    this.notificationQueue.push(message);
    await this.checkNotificationQueue(tab, { password: newPassword, username, uri: loginDomain });
  }

  private async saveOrUpdateCredentials(tab: chrome.tabs.Tab, folderId?: string) {
    for (let i = this.notificationQueue.length - 1; i >= 0; i--) {
      const queueMessage = this.notificationQueue[i];
      if (queueMessage.tabId !== tab.id ||
        (queueMessage.type !== NotificationQueueMessageType.addLogin && queueMessage.type !== NotificationQueueMessageType.changePassword)) {
        continue;
      }

      const tabDomain = Utils.getDomain(tab.url);
      if (tabDomain != null && tabDomain !== queueMessage.domain) {
        continue;
      }
      this.notificationQueue.splice(i, 1);
      BrowserApi.tabSendMessageData(tab, 'closeNotificationBar');
      if (queueMessage.type === NotificationQueueMessageType.changePassword) {
        const message = (queueMessage as AddChangePasswordQueueMessage);
        const cipher = await this.getDecryptedCipherById(message.cipherId);
        if (cipher == null) {
          return;
        }
        await this.updateCipher(cipher, message.newPassword, message.username);
        return;
      }

      if (!queueMessage.wasVaultLocked) {
        await this.createNewCipher(queueMessage as AddLoginQueueMessage, folderId);
      }

      // If the vault was locked, check if a cipher needs updating instead of creating a new one
      if (queueMessage.type === NotificationQueueMessageType.addLogin && queueMessage.wasVaultLocked === true) {
        const message = (queueMessage as AddLoginQueueMessage);
        const ciphers = await this.cipherService.getAllDecryptedForUrl(message.uri) || [];
        const usernameMatches = ciphers.filter(c => c.login.username != null &&
          c.login.username.toLowerCase() === message.username);

        if (usernameMatches.length >= 1) {
          await this.updateCipher(usernameMatches[0], message.password);
          return;
        }

        await this.createNewCipher(message, folderId);
      }

    }
  }

  private async createNewCipher(queueMessage: AddLoginQueueMessage, folderId: string) {
    const loginModel = new LoginView();
    const loginUri = new LoginUriView();
    loginUri.uri = queueMessage.uri;
    loginModel.uris = [loginUri];
    loginModel.username = queueMessage.username;
    loginModel.password = queueMessage.password;
    const model = new CipherView();
    model.name = Utils.getHostname(queueMessage.uri) || queueMessage.domain;
    model.name = model.name.replace(/^www\./, '');
    model.type = CipherType.Login;
    model.login = loginModel;

    if (!Utils.isNullOrWhitespace(folderId)) {
      const folders = await this.folderService.getAllDecrypted();
      if (folders.some(x => x.id === folderId)) {
        model.folderId = folderId;
      }
    }

    const cipher = await this.cipherService.encrypt(model);
    const data = new CipherRequest(cipher)
    try {
      const res: any = await this.request.create_ciphers_vault(data);

      const cipherResponse = new CipherResponse({ ...data, id: res ? res.id : '' })
      const userId = await this.userService.getUserId();
      const cipherData = new CipherData(cipherResponse, userId)
      this.cipherService.upsert(cipherData)
      this.notificationAlert('password_added')
    } catch (e) {
      if (e.response && e.response.data && e.response.data.code === '5002') {
        this.notificationAlert('password_limited')
      }
    }
  }

  private async createNewOTP(otpData: any) {
    const cipher = new CipherView()
    cipher.name = otpData.name;
    cipher.type = CipherType.SecureNote;
    cipher.secureNote = new SecureNoteView();
    cipher.secureNote.type = 0
    cipher.notes = otpData.notes
    const cipherEnc = await this.cipherService.encrypt(cipher)
    const data = new CipherRequest(cipherEnc)
    data.type = CipherType.OTP;
    try {
      const res: any = await this.request.create_ciphers_vault(data);

      const cipherResponse = new CipherResponse({ ...data, id: res ? res.id : '' })
      const userId = await this.userService.getUserId();
      const cipherData = new CipherData(cipherResponse, userId)
      this.cipherService.upsert(cipherData)
      this.notificationAlert('otp_added')
    } catch (e) {
      if (e.response && e.response.data && e.response.data.code === '5002') {
        this.notificationAlert('otp_limited')
      }
    }
  }

  private async getDecryptedCipherById(cipherId: string) {
    const cipher = await this.cipherService.get(cipherId);
    if (cipher != null && cipher.type === CipherType.Login) {
      return await cipher.decrypt();
    }
    return null;
  }

  private async updateCipher(cipher: CipherView, newPassword: string, username: string = '') {
    if (cipher != null && cipher.type === CipherType.Login) {
      cipher.login.password = newPassword;
      if (username) {
        cipher.login.username = username;
      }
      const newCipher = await this.cipherService.encrypt(cipher);
      const data = new CipherRequest(newCipher)
      try {
        const res: any = await this.request.update_cipher(cipher.id, data)
        const cipherResponse = new CipherResponse(res)
        const userId = await this.userService.getUserId();
        const cipherData = new CipherData(cipherResponse, userId);
        await this.cipherService.upsert(cipherData);
        this.notificationAlert('username_password_updated')
      } catch (e) {
      }
    }
  }

  private async saveNever(tab: chrome.tabs.Tab) {
    for (let i = this.notificationQueue.length - 1; i >= 0; i--) {
      const queueMessage = this.notificationQueue[i];
      if (queueMessage.tabId !== tab.id || queueMessage.type !== NotificationQueueMessageType.addLogin) {
        continue;
      }

      const tabDomain = Utils.getDomain(tab.url);
      if (tabDomain != null && tabDomain !== queueMessage.domain) {
        continue;
      }

      this.notificationQueue.splice(i, 1);
      BrowserApi.tabSendMessageData(tab, 'closeNotificationBar');

      const hostname = Utils.getHostname(tab.url);
      await this.cipherService.saveNeverDomain(hostname);
    }
  }

  private async allowPersonalOwnership(): Promise<boolean> {
    return !await this.policyService.policyAppliesToUser(PolicyType.PersonalOwnership);
  }

  private async turnOffAutofill(tab: chrome.tabs.Tab) {
    BrowserApi.tabSendMessageData(tab, "closeInformMenu");
    const hostname = Utils.getHostname(tab.url);
    await this.cipherService.saveNeverDomain(hostname);
  }

  private async notificationAlert(type: string) {
    const tab = await BrowserApi.getTabFromCurrentWindow();
    BrowserApi.tabSendMessage(tab, {
      command: 'alert',
      tab: tab,
      type: type,
    });
  }
}
