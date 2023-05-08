import { EnvironmentService } from 'jslib-common/abstractions/environment.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { NotificationsService } from 'jslib-common/abstractions/notifications.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { SystemService } from 'jslib-common/abstractions/system.service';
import { ConstantsService } from 'jslib-common/services/constants.service';
import { AutofillService } from '../services/abstractions/autofill.service';
import BrowserPlatformUtilsService from '../services/browserPlatformUtils.service';
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

import { Utils } from 'jslib-common/misc/utils';
import LockedVaultPendingNotificationsItem from './models/lockedVaultPendingNotificationsItem';
import axios from "axios";

export default class RuntimeBackground {
  private autofillTimeout: any;
  private pageDetailsToAutoFill: any[] = [];
  private onInstalledReason: string = null;
  private lockedVaultPendingNotifications: LockedVaultPendingNotificationsItem[] = [];
  private lockedVaultPendingInformMenu: any[] = []
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
        this.notificationsService.updateConnection(msg.command === "unlocked");
        this.systemService.cancelProcessReload();

        if (item) {
          await BrowserApi.tabSendMessageData(
            item.commandToRetry.sender.tab,
            "unlockCompleted",
            item
          );
        }
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
      case "syncCompleted":
        if (msg.successfully) {
          setTimeout(async () => await this.main.refreshBadgeAndMenu(), 2000);
        }
        break;
      case "promptForLogin":
        await BrowserApi.createNewTab(
          "popup.html?uilocation=popout",
          true,
          true
        );
        break;
      case "showDialogResolve":
        this.platformUtilsService.resolveDialogPromise(
          msg.dialogId,
          msg.confirmed
        );
        break;
      case "bgCollectPageDetails":
        await this.main.collectPageDetailsForContentScript(
          sender.tab,
          msg.sender,
          sender.frameId
        );
        break;
      case "deletedCipher":
        await this.main.refreshBadgeAndMenu();
        break;
      case "bgReseedStorage":
        await this.main.reseedStorage();
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
                window: window
              });
            }
            break;
          case "informMenu":
          case "contextMenu":
            clearTimeout(this.autofillTimeout);
            this.pageDetailsToAutoFill.push({
              frameId: sender.frameId,
              tab: msg.tab,
              details: msg.details
            });
            this.autofillTimeout = setTimeout(
              async () => await this.autofillPage(),
              300
            );
            break;
          default:
            break;
        }
        break;
      case "bgGeneratePassword":
        this.generatePassword(sender.tab, msg.responseCommand, msg.options, msg.isReplace);
      case "authResult":
        const vaultUrl = this.environmentService.getWebVaultUrl();

        if (
          msg.referrer == null ||
          Utils.getHostname(vaultUrl) !== msg.referrer
        ) {
          return;
        }

        try {
          BrowserApi.createNewTab(
            "popup/index.html?uilocation=popout#/sso?code=" +
            msg.code +
            "&state=" +
            msg.state
          );
        } catch { }
        break;
      case "cs-authResult":
        const token: any = await this.storageService.get("cs_token");
        if (!token) {
          const myHeaders = {
            headers: { Authorization: `Bearer ${msg.token}` }
          };
          try {
            const url = `${process.env.VUE_APP_BASE_API_URL}/sso/access_token`;
            axios
              .post(
                url,
                {
                  SERVICE_URL: "/sso",
                  SERVICE_SCOPE: "pwdmanager",
                  CLIENT: "browser"
                },
                myHeaders
              )
              .then(async result => {
                const access_token = result.data ? result.data.access_token : "";
                const store: any = await this.storageService.get("cs_store");
                await this.storageService.save("cs_token", access_token);
                await this.updateStoreService('isLoggedIn', true);
                await this.messagingService.send('loggedIn')
                if (store && store.savePopup) {
                  setTimeout(async () => {
                    const tab = await BrowserApi.getTabFromCurrentWindow();
                    await BrowserApi.tabSendMessageData(tab, 'openPopupIframe');
                  }, 1000);
                }
              });
          } catch (e) {
            console.log(e);
          }
        }
        break;
      case "cs-logout":
        const userId = await this.userService.getUserId();
        await Promise.all([
          this.cryptoService.clearKeys(),
          this.storageService.remove("cs_token"),

          this.folderService.clear(userId),
          this.collectionService.clear(userId),
          this.cipherService.clear(userId),
          this.settingsService.clear(userId),
          this.policyService.clear(userId),
          this.tokenService.clearToken(),
          this.userService.clear()
        ]);
        break;
      case "locker-authResult":
        break;
      case "webAuthnResult":
        const vaultUrl2 = this.environmentService.getWebVaultUrl();

        if (
          msg.referrer == null ||
          Utils.getHostname(vaultUrl2) !== msg.referrer
        ) {
          return;
        }

        const params = `webAuthnResponse=${encodeURIComponent(
          msg.data
        )};remember=${msg.remember}`;
        BrowserApi.createNewTab(
          `popup/index.html?uilocation=popout#/2fa;${params}`,
          undefined,
          false
        );
        break;
      case "reloadPopup":
        this.messagingService.send("reloadPopup");
        break;
      case "emailVerificationRequired":
        this.messagingService.send("showDialog", {
          dialogId: "emailVerificationRequired",
          title: this.i18nService.t("emailVerificationRequired"),
          text: this.i18nService.t("emailVerificationRequiredDesc"),
          confirmText: this.i18nService.t("ok"),
          type: "info"
        });
        break;
      case "getClickedElementResponse":
        this.platformUtilsService.copyToClipboard(msg.identifier, {
          window: window
        });
        break;
      case "authAccessToken":
        await this.authAccessToken(msg.sender)
        break;
      case "openPopupIframe":
        if (!this.platformUtilsService.isFirefox()) {
          await this.updateStoreService('savePopup', true);
        }
        break;
      case "closePopupIframe":
        await this.updateStoreService('savePopup', false);
      case "updateStoreService":
        if (msg.sender) {
          await this.updateStoreService(msg.sender.key, msg.sender.value);
        }
      default:
        break;
    }
  }

  private async autofillPage() {
    const cipherId = this.main.loginToAutoFill.id
    const cipherFavorite = this.main.loginToAutoFill.favorite
    const totpCode = await this.autofillService.doAutoFill({
      cipher: this.main.loginToAutoFill,
      pageDetails: this.pageDetailsToAutoFill,
      fillNewPassword: true,
    });

    if (totpCode != null) {
      this.platformUtilsService.copyToClipboard(totpCode, { window: window });
    }
    this.main.loginToAutoFill = null;
    this.pageDetailsToAutoFill = [];

    // Update used time
    const csToken = await this.main.storageService.get<string>("cs_token");
    const headers = {
      "Authorization": "Bearer " + csToken,
      "Content-Type": "application/json; charset=utf-8"
    };
    const res = await axios.put(
      `${process.env.VUE_APP_BASE_API_URL}/cystack_platform/pm/ciphers/${cipherId}/use`,
      { use: true, favorite: cipherFavorite },
      { headers: headers }
    )
    const cipherResponse = new CipherResponse(res.data)
    const userId = await this.userService.getUserId();
    const cipherData = new CipherData(cipherResponse, userId);
    this.cipherService.upsert(cipherData)
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

  private async generatePassword(tab, responseCommand, inputOptions, isReplace) {
    const oldGeneratePassword = await this.passService.getGeneratePassword();
    let password = '';
    let options = null;
    if (oldGeneratePassword && !isReplace && tab.id === oldGeneratePassword.tab.id) {
      password = oldGeneratePassword.password;
      options = JSON.parse(oldGeneratePassword.options)
    }
    if (!options) {
      options = inputOptions || (await this.passwordGenerator.getOptions())[0]
    } else {
      await BrowserApi.tabSendMessageData(tab, 'setGeneratePasswordOptions', { options });
    }
    if (!password) {
      password = await this.passwordGenerator.generatePassword(options);
    }
    if (!options.lowercase && !options.uppercase && !options.lowercase && !options.number && !options.special) {
      options.lowercase = true
    }
    let passwordStrength: any = {}
    if (password) {
      passwordStrength = this.passwordGenerator.passwordStrength(password, ['cystack']) || {}
    }
    await this.passService.setInformation(password, options, tab)
    const responseData: any = {};
    responseData.password = password
    responseData.passwordStrength = passwordStrength
    await BrowserApi.tabSendMessageData(tab, responseCommand, responseData);
    this.platformUtilsService.copyToClipboard(password, { window: window });
    this.passwordGenerator.addHistory(password);
  }

  private async authAccessToken(sender: any) {
    // check open popup
    const tab: any = await BrowserApi.getTabFromCurrentWindow()
    if (tab) {
      let url = `${process.env.VUE_APP_ID_URL}/${sender.type}?SERVICE_URL=${encodeURIComponent("/sso")}&SERVICE_SCOPE=pwdmanager&CLIENT=browser&EXTERNAL_URL=${tab.url || ''}`;
      if (sender.provider) {
        url += `&provider=${sender.provider}`
      }
      if (process.env.VUE_APP_ENVIRONMENT) {
        url += `&ENVIRONMENT=${process.env.VUE_APP_ENVIRONMENT}`
      }
      await BrowserApi.updateCurrentTab(tab, url);
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
}
