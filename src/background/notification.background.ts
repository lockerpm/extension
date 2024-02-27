import { CipherType } from 'jslib-common/enums/cipherType';
import { SecureNoteView } from 'jslib-common/models/view/secureNoteView';
import { CipherView } from 'jslib-common/models/view/cipherView';

import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { FolderService } from 'jslib-common/abstractions/folder.service';
import { PolicyService } from 'jslib-common/abstractions/policy.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { UserService } from 'jslib-common/abstractions/user.service';
import { TotpService } from 'jslib-common/abstractions/totp.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';
import { ConstantsService } from 'jslib-common/services/constants.service';
import { AutofillService } from '../services/abstractions/autofill.service';
import { CipherRepromptType } from 'jslib-common/enums/cipherRepromptType';
import { PasswordRepromptService } from 'jslib-common/abstractions/passwordReprompt.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';

import { BrowserApi } from '../browser/browserApi';
import { PopupUtilsService } from '../services/popup-utils.service';

import MainBackground from './main.background';
import Requestground from './request.backgroud';

import { Utils } from 'jslib-common/misc/utils';

import { PolicyType } from 'jslib-common/enums/policyType';

import AddLoginRuntimeMessage from './models/addLoginRuntimeMessage';
import ChangePasswordRuntimeMessage from './models/changePasswordRuntimeMessage';
import { NotificationQueueMessageType } from './models/notificationQueueMessageType';
import { CipherRequest } from 'jslib-common/models/request/cipherRequest';
import { CipherData } from 'jslib-common/models/data/cipherData';
import { CipherResponse } from 'jslib-common/models/response/cipherResponse';

let currentLoginInfo = null

export default class NotificationBackground {
  constructor(
    private main: MainBackground,
    private autofillService: AutofillService,
    private cipherService: CipherService,
    private storageService: StorageService,
    private vaultTimeoutService: VaultTimeoutService,
    private policyService: PolicyService,
    private folderService: FolderService,
    private userService: UserService,
    private totpService: TotpService,
    private request: Requestground,
    private passwordRepromptService: PasswordRepromptService,
    private popupUtilsService: PopupUtilsService,
    private platformUtilsService: PlatformUtilsService
  ) { }
  async init() {
    if (chrome.runtime == null) {
      return;
    }

    BrowserApi.messageListener('notification.background', async (msg: any, sender: chrome.runtime.MessageSender) => {
      await this.processMessage(msg, sender);
    });
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
        currentLoginInfo = null;
        break;
      case 'bgAddLogin':
        await this.addLogin(msg.login, sender.tab);
        break;
      case 'bgChangedPassword':
        await this.changedPassword(msg.data, sender.tab);
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
              if (form.username) {
                usernameFields.push(form.username)
              }
            }
            await BrowserApi.tabSendMessageData(msg.tab, 'notificationBarPageDetails', {
              details: msg.details,
              forms: forms,
              passwordFields: passwordFields,
              usernameFields: usernameFields,
              isLocked: await this.vaultTimeoutService.isLocked()
            });
            chrome.storage.local.get('enableAutofill', async (autofillObj: any) => {
              if (autofillObj.enableAutofill === false) return;
              const tab = await BrowserApi.getTabFromCurrentWindow();
              if (!tab || !tab.url) {
                return;
              }
              const excludeDomain: any = await this.cipherService.getIncludedDomainByUrl(tab.url)
              if (!!excludeDomain) {
                return;
              }
              if (await this.vaultTimeoutService.isLocked()) {
                return
              }
              // check is login page
              if (
                passwordFields.filter((f) => f.type === 'password' && f.visible && f.viewable).length <= 1
                && !passwordFields.filter((f) => f.type === 'password')[0]?.value
                && usernameFields.filter((f) => f.visible && f.viewable).length <= 1
              ) {
                this.autofillFirstPage(sender.tab);
              }

              // check is otp page
              if (forms.find((f) => f.otps.length > 0)) {
                this.autofillOTPFirstPage(sender.tab);
              }
            })
            this.main.refreshBadgeAndMenu()
            break;
          case 'autofillItem':
            if (
              msg.cipher.reprompt !== CipherRepromptType.None && this.passwordRepromptService &&
              !(await this.passwordRepromptService.showPasswordPrompt())
            ) {
              return;
            }
            const pageDetailsObj = {
              frameId: sender.frameId,
              tab: msg.tab,
              details: msg.details,
            };
            try {
              const totpPromise = await this.autofillService.doAutoFill({
                cipher: msg.cipher,
                pageDetails: [pageDetailsObj],
                fillNewPassword: true,
              });
              if (totpPromise) {
                this.storageService.save('login_totp_cipher', msg.cipher)
                setTimeout(async () => {
                  await this.storageService.remove('login_totp_cipher')
                }, 60000);
              }
            } catch (e) {
              BrowserApi.tabSendMessage(msg.tab, {
                command: 'alert',
                tab: msg.tab,
                type: 'autofill_error',
              });
            }
            break
          case 'autofillOTP':
            let totp = '';
            if (msg.cipher.type == CipherType.Login) {
              totp = await this.totpService.getCode(msg.cipher.login.totp);
            } else if (msg.cipher.type == CipherType.OTP) {
              totp = await this.totpService.getCode(msg.cipher.notes);
            }
            if (totp) {
              const otpForms = this.autofillService.getFormsWithPasswordFields(msg.details);
              BrowserApi.tabSendMessage(msg.tab, {
                command: 'fillOTPForm',
                forms: otpForms.filter((f) => f.otps.length > 0),
                totp: totp
              });
            }
            break
          default:
            break;
        }
        break;
      case 'useImage':
        if (chrome.tabs && chrome.tabs.captureVisibleTab) {
          chrome.tabs.captureVisibleTab(null, {}, function (dataUri) {
            BrowserApi.tabSendMessage(msg.tab, {
              command: 'capturedImage',
              tab: msg.tab,
              sender: dataUri,
              isPasswordOTP: msg.isPasswordOTP
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
          if (msg.isPasswordOTP) {
            const currentRouterString: any = await this.storageService.get('current_router')
            const currentRouter = JSON.parse(currentRouterString);
            await this.storageService.save('current_router', JSON.stringify({
              ...currentRouter,
              params: {
                ...currentRouter.params,
                cipherForm: {
                  ...currentRouter.params.cipherForm,
                  login: {
                    ...currentRouter.params.cipherForm.login,
                    totp: msg.sender.data
                  }
                }
              },
            }))
            this.notificationAlert('password_otp_added')
            senderMessage = 'removeLockerWrapper';
          } else {
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
        const currentCiphers = await this.cipherService.getAllDecryptedForUrl(tab.url) || [];
        const loginCiphers = this.cipherService.sortCiphers(currentCiphers.filter(c => c.type === CipherType.Login))
        if (loginCiphers.length > 0) {
          BrowserApi.tabSendMessage(tab, {
            command: 'collectPageDetails',
            tab: tab,
            sender: 'autofillItem',
            cipher: loginCiphers[0]
          });
        }
      }
    } catch (error) {
    }
  }

  private async autofillOTPFirstPage(tab: chrome.tabs.Tab) {
    const loginTOTPCipher: any = await this.storageService.get('login_totp_cipher') || null
    if (loginTOTPCipher && loginTOTPCipher.login?.totp) {
      BrowserApi.tabSendMessage(tab, {
        command: 'collectPageDetails',
        tab: tab,
        sender: 'autofillOTP',
        cipher: loginTOTPCipher
      });
    }
    await this.storageService.remove('login_totp_cipher')
  }

  async checkNotificationQueue(tab: chrome.tabs.Tab = null, loginInfo: object = null): Promise<void> {
    if (loginInfo) {
      currentLoginInfo = loginInfo
    }
    if (currentLoginInfo) {
      const tabInfo = tab || await BrowserApi.getTabFromCurrentWindow();
      const tabDomain = Utils.getDomain(tabInfo.url);
      if (tabInfo && tabDomain === currentLoginInfo.domain) {
        this.doNotificationQueueCheck(tabInfo, currentLoginInfo);
      }
    }
  }

  private doNotificationQueueCheck(tab: chrome.tabs.Tab, loginInfo: any): void {
    if (tab == null) {
      return;
    }

    if (loginInfo.type === NotificationQueueMessageType.addLogin) {
      BrowserApi.tabSendMessageData(tab, 'openNotificationBar', {
        type: 'add',
        loginInfo,
      });
    } else if (loginInfo.type === NotificationQueueMessageType.changePassword) {
      BrowserApi.tabSendMessageData(tab, "openNotificationBar", {
        type: "change",
        loginInfo,
      });
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
    await this.checkNotificationQueue(tab, {
      type: NotificationQueueMessageType.addLogin,
      username: loginInfo.username,
      password: loginInfo.password,
      domain: loginDomain,
      uri: loginInfo.url,
      tabId: tab.id,
      expires: new Date((new Date()).getTime() + 5 * 60000), // 5 minutes
      wasVaultLocked: isVaultLocked,
    });
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
    await this.checkNotificationQueue(tab, {
      type: NotificationQueueMessageType.changePassword,
      cipherId: cipherId,
      username,
      newPassword: newPassword,
      domain: loginDomain,
      tabId: tab.id,
      expires: new Date((new Date()).getTime() + 5 * 60000), // 5 minutes
      wasVaultLocked: isVaultLocked,
    });
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
      this.cipherService.upsert(cipherData);
      this.notificationAlert('otp_added');
    } catch (e) {
      if (e.response && e.response.data && e.response.data.code === '5002') {
        this.notificationAlert('otp_limited');
      }
    }
  }

  private async allowPersonalOwnership(): Promise<boolean> {
    return !await this.policyService.policyAppliesToUser(PolicyType.PersonalOwnership);
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
