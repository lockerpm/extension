import { EnvironmentService } from 'jslib-common/abstractions/environment.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { NotificationsService } from 'jslib-common/abstractions/notifications.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { SystemService } from 'jslib-common/abstractions/system.service';
import { ConstantsService } from 'jslib-common/services/constants.service';
import { AutofillService } from '../services/abstractions/autofill.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { FolderService } from 'jslib-common/abstractions/folder.service';
import { CollectionService } from 'jslib-common/abstractions/collection.service';
import { UserService } from 'jslib-common/abstractions/user.service';
import { SettingsService } from 'jslib-common/abstractions/settings.service';
import { PolicyService } from 'jslib-common/abstractions/policy.service';
import { TokenService } from 'jslib-common/abstractions/token.service';
import { PasswordGenerationService } from 'jslib-common/abstractions/passwordGeneration.service';
import { CipherData } from 'jslib-common/models/data/cipherData';
import { CipherResponse } from 'jslib-common/models/response/cipherResponse';
import { PassService } from 'jslib-common/abstractions/pass.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';

import { BrowserApi } from '../browser/browserApi';

import MainBackground from './main.background';
import RequestBackground from './request.backgroud';

import BrowserPlatformUtilsService from '../services/browserPlatformUtils.service';
import LockedVaultPendingNotificationsItem from './models/lockedVaultPendingNotificationsItem';

export default class RuntimeBackground {
  private autofillTimeout: any;
  private pageDetailsToAutoFill: any[] = [];
  private onInstalledReason: string = null;
  private lockedVaultPendingNotifications: LockedVaultPendingNotificationsItem[] = [];
  private lockedVaultPendingInformMenu: any[] = []
  private currentLocation = ''
  constructor(
    private main: MainBackground,
    private autofillService: AutofillService,
    private platformUtilsService: BrowserPlatformUtilsService,
    private storageService: StorageService,
    private i18nService: I18nService,
    private notificationsService: NotificationsService,
    private systemService: SystemService,
    private environmentService: EnvironmentService,
    private messagingService: MessagingService,
    private cryptoService: CryptoService,
    private cipherService: CipherService,
    private folderService: FolderService,
    private collectionService: CollectionService,
    private userService: UserService,
    private settingsService: SettingsService,
    private policyService: PolicyService,
    private tokenService: TokenService,
    private passwordGenerator: PasswordGenerationService,
    private passService: PassService,
    private request: RequestBackground,
    private vaultTimeoutService: VaultTimeoutService
  ) {
    chrome.runtime?.onInstalled?.addListener((details: any) => {
      this.onInstalledReason = details.reason;
    });
  }

  async init() {
    if (!chrome.runtime) {
      return;
    }

    await this.checkOnInstalled();
    BrowserApi.messageListener('runtime.background', async (msg: any, sender: chrome.runtime.MessageSender, sendResponse: any) => {
      await this.processMessage(msg, sender, sendResponse);
    });
    chrome.runtime.onMessageExternal.addListener(
      async (msg, sender, sendResponse) => {
        await this.processMessage(msg, sender, sendResponse)
      }
    );
  }

  async processMessage(msg: any, sender: any, sendResponse: any) {
    switch (msg.command) {
      case "loggedIn":
      case "unlocked":
        this.handleUnlocked()
        break;
      case "addToLockedVaultPendingNotifications":
        this.lockedVaultPendingNotifications.push(msg.data);
        break;
      case "addToLockedVaultPendingInformMenu":
        this.lockedVaultPendingInformMenu.push(msg.data);
        break
      case "logout":
        await this.main.logout(msg.expired);
        break;
      case "promptForLogin":
        await BrowserApi.createNewTab(
          "popup.html?uilocation=popout",
          true,
          true
        );
        break;
      case "bgCollectPageDetails":
        await this.main.collectPageDetailsForContentScript(
          sender.tab,
          msg.sender,
          sender.frameId
        );
        break;
      case "collectPageDetailsResponse":
        switch (msg.sender) {
          case "autofiller":
          case "autofill_cmd":
            const totpCode = await this.autofillService.doAutoFillActiveTab(
              [
                {
                  frameId: sender.frameId,
                  tab: msg.tab,
                  details: msg.details
                }
              ],
              msg.sender === "autofill_cmd"
            );
            if (totpCode != null) {
              this.platformUtilsService.copyToClipboard(totpCode, {
                window: self
              });
            }
            break;
          default:
            break;
        }
        break;
      case "sso-authResult":
        if (msg.email) {
          await this.storageService.save('sso_email', msg.email);
        }
        break;
      case "getClickedElementResponse":
        this.platformUtilsService.copyToClipboard(msg.identifier, {
          window: self
        });
        break;
      case "cs-logout":
        this.main.onLogout();
        break;
      default:
        break;
    }
  }

  private async checkOnInstalled() {
    setTimeout(async () => {
      if (this.onInstalledReason != null) {
        if (this.onInstalledReason === 'install') {
          await this.setDefaultSettings();
        }

        this.onInstalledReason = null;
      }
    }, 100);
  }

  private async setDefaultSettings() {
    // Default timeout option to "on restart".
    const currentVaultTimeout = await this.storageService.get<number>(ConstantsService.vaultTimeoutKey);
    if (currentVaultTimeout == null) {
      await this.storageService.save(ConstantsService.vaultTimeoutKey, -1);
    }

    // Default action to "lock".
    const currentVaultTimeoutAction = await this.storageService.get<string>(ConstantsService.vaultTimeoutActionKey);
    if (currentVaultTimeoutAction == null) {
      await this.storageService.save(ConstantsService.vaultTimeoutActionKey, 'lock');
    }
  }

  async authAccessToken(type: string, provider: string) {
    if (type === 'captcha') {
      BrowserApi.createNewTab(`${process.env.VUE_APP_ID_URL}/captcha`, true, true);
      return;
    }
    const tab: any = await BrowserApi.getTabFromCurrentWindow()
    if (tab) {
      BrowserApi.tabSendMessageData(tab, 'closePopupIframe')
      let url = ''
      if (type === 'id-info') {
        BrowserApi.createNewTab(`${process.env.VUE_APP_WEB_URL}/settings/account`, true, true);
      } else if (provider === 'sso') {
        this.currentLocation = tab.url
        BrowserApi.createNewTab(`${process.env.VUE_APP_ID_URL}/login/sso?client=extension`, true, true);
      } else {
        url = `${process.env.VUE_APP_ID_URL}/${type}?SERVICE_URL=${encodeURIComponent("/sso")}&SERVICE_SCOPE=pwdmanager&CLIENT=browser&EXTERNAL_URL=${tab.url || ''}`;
        if (provider) {
          url += `&provider=${provider}`
        }
        if (process.env.VUE_APP_ENVIRONMENT) {
          url += `&ENVIRONMENT=${process.env.VUE_APP_ENVIRONMENT}`
        }
        BrowserApi.createNewTab(url, true, true);
      }
    }
  }

  async updateStoreService(key: string, value: any) {
    const store = await this.storageService.get("cs_store");
    let oldStoreParsed = {};
    if (typeof store === "object") {
      oldStoreParsed = store;
    }
    await this.storageService.save("cs_store", {
      ...oldStoreParsed,
      [key]: value
    });
  }

  async updateStoreServiceInfo(value = {}) {
    const store = await this.storageService.get("cs_store");
    let oldStoreParsed = {};
    if (typeof store === "object") {
      oldStoreParsed = store;
    }
    await this.storageService.save("cs_store", {
      ...oldStoreParsed,
      ...value
    });
  }

  async handleUnlocked() {
    let item: LockedVaultPendingNotificationsItem;
    if (this.lockedVaultPendingNotifications.length > 0 || this.lockedVaultPendingInformMenu.length > 0) {
      await BrowserApi.closeLoginTab();

      item = this.lockedVaultPendingNotifications.pop() || this.lockedVaultPendingInformMenu.pop();
      if (item.commandToRetry.sender?.tab?.id) {
        await BrowserApi.focusSpecifiedTab(
          item.commandToRetry.sender.tab.id
        );
      }
    }
    await this.main.refreshBadgeAndMenu(false);
    await this.notificationsService.connectWebSocket();
    this.systemService.cancelProcessReload();
    if (item) {
      await BrowserApi.tabSendMessageData(
        item.commandToRetry.sender.tab,
        "unlockCompleted",
        item
      );
    }
  }

  async handleOpenPopupIframe(timeout = 0) {
    setTimeout(async () => {
      const tab = await BrowserApi.getTabFromCurrentWindow();
      if (!tab) {
        return;
      }
      BrowserApi.tabSendMessage(tab, {
        command: 'openPopupIframe',
        tab: tab,
      });
    }, timeout);
  }

  async handleGetUserInfo() {
    let userPw: any = null
    await Promise.all([
      this.request.users_me(),
    ]).then(([userMe]) => {
      userPw = userMe;
    }).catch(() => {
      userPw = null
    })
    await Promise.all([
      await this.storageService.save('cs_user_pw', userPw),
      this.vaultTimeoutService.setVaultTimeoutOptions(
        userPw.timeout,
        userPw.timeout_action
      )
    ])
  }
}
