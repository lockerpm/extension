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

import { BrowserApi } from '../browser/browserApi';

import MainBackground from './main.background';

import { Utils } from 'jslib-common/misc/utils';
import LockedVaultPendingNotificationsItem from './models/lockedVaultPendingNotificationsItem';
import axios from "axios";
const CLIENT_ID = encodeURIComponent('31609893092-0etuuag1o662fpa0c6sap5v96lc44onb.apps.googleusercontent.com');
const FB_CLIENT_ID = encodeURIComponent("914989149119054");
// const GITHUB_CLIENT_ID = encodeURIComponent("2d2090f44568a41519f3");
const GITHUB_CLIENT_ID = encodeURIComponent("d47ecf32f5a59a07f34d"); 
const GITHUB_CLIENT_SECRET = encodeURIComponent("b44eb6fc95c9c48182a1ccb6d45f79b3eb579cb5")
const RESPONSE_TYPE = encodeURIComponent('token');
const REDIRECT_URI = encodeURIComponent('https://cmajindocfndlkpkjnmjpjoilibjgmgh.chromiumapp.org')
// const REDIRECT_URI = encodeURIComponent('https://hciabnakeampkoldeohkfcbadmgcmebl.chromiumapp.org')
const SCOPE = encodeURIComponent('openid email profile');
const FB_SCOPE = encodeURIComponent('public_profile+email');
const GITHUB_SCOPE = encodeURIComponent('read:user+user:email')
const PROMPT = encodeURIComponent('consent');

function create_auth_endpoint() {
    // let nonce = encodeURIComponent(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    const STATE = encodeURIComponent(Math.random().toString(36).substring(2, 15));
    let openId_endpoint_url =
        `https://accounts.google.com/o/oauth2/v2/auth
?client_id=${CLIENT_ID}
&response_type=${RESPONSE_TYPE}
&redirect_uri=${REDIRECT_URI}
&scope=${SCOPE}
&state=${STATE}
&prompt=${PROMPT}`;

    return openId_endpoint_url;
}

function create_fb_auth_endpoint() {
  const STATE = encodeURIComponent(Math.random().toString(36).substring(2, 15));
    let endpoint_url = 'https://www.facebook.com/v13.0/dialog/oauth?client_id=' + FB_CLIENT_ID +
              '&response_type=token' +
              '&scope=' + FB_SCOPE +
              '&protocol=oauth2' +
              '&redirect_uri=' + REDIRECT_URI +
              '&state=' + STATE

    return endpoint_url;
}

function create_github_auth_endpoint() {
  console.log(chrome.identity.getRedirectURL());
  const STATE = encodeURIComponent(Math.random().toString(36).substring(2, 15));
    let endpoint_url = 'https://www.github.com/login/oauth/authorize?client_id=' + GITHUB_CLIENT_ID +
              '&response_type=code' +
              '&scope=' + GITHUB_SCOPE +
              '&redirect_uri=' + REDIRECT_URI +
              '&state=' + STATE

    return endpoint_url;
}

export default class RuntimeBackground {
  private autofillTimeout: any;
  private pageDetailsToAutoFill: any[] = [];
  private onInstalledReason: string = null;
  private lockedVaultPendingNotifications: LockedVaultPendingNotificationsItem[] = [];

  constructor(private main: MainBackground, private autofillService: AutofillService,
              private platformUtilsService: BrowserPlatformUtilsService,
              private storageService: StorageService, private i18nService: I18nService,
              private notificationsService: NotificationsService, private systemService: SystemService,
              private environmentService: EnvironmentService, private messagingService: MessagingService, 
              private cryptoService: CryptoService, private cipherService: CipherService, private folderService: FolderService, private collectionService: CollectionService,
              private userService: UserService, private settingsService: SettingsService, private policyService: PolicyService, private tokenService: TokenService, private passwordGenerator: PasswordGenerationService) {

    // onInstalled listener must be wired up before anything else, so we do it in the ctor
    chrome.runtime.onInstalled.addListener((details: any) => {
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
        // console.log(sender)
        await  this.processMessage(msg, sender, sendResponse)
      }
    );
  }

  async processMessage(msg: any, sender: any, sendResponse: any) {
    // console.log(`runtimeBackground processMessage: ${msg} - sender: ${sender} - data: ${msg.data}`);
    // console.log(msg)
    switch (msg.command) {
      case "loggedIn":
      case "unlocked":
        let item: LockedVaultPendingNotificationsItem;

        if (this.lockedVaultPendingNotifications.length > 0) {
          await BrowserApi.closeLoginTab();

          item = this.lockedVaultPendingNotifications.pop();
          if (item.commandToRetry.sender?.tab?.id) {
            await BrowserApi.focusSpecifiedTab(
              item.commandToRetry.sender.tab.id
            );
          }
        }
        // await this.main.setIcon(); // error => prevent send message unlockCompleted
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
        // console.log(msg.data);
        this.lockedVaultPendingNotifications.push(msg.data);
        break;
      case "logout":
        await this.main.logout(msg.expired);
        break;
      case "syncCompleted":
        if (msg.successfully) {
          setTimeout(async () => await this.main.refreshBadgeAndMenu(), 2000);
        }
        break;
      case "openPopup":
        await this.main.openPopup();
        break;
      case "promptForLogin":
        // await BrowserApi.createNewTab('popup/index.html?uilocation=popout', true, true);
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
      case "bgUpdateContextMenu":
      case "editedCipher":
      case "addedCipher":
        // console.log("added Cipher");
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
        this.generatePassword(sender.tab, msg.responseCommand, msg.options);
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
        } catch {}
        break;
      case "cs-authResult":
        // console.log(msg.referrer);
        // if (msg.referrer == null || Utils.getHostname(vaultUrl) !== msg.referrer) {
        //     return;
        // }
        // const token = await this.storageService.get("cs_token");
        // if (token) {
        //   try {
        //     const myHeaders = {
        //       headers: { Authorization: `Bearer ${token}` }
        //     };
        //     await axios.post(
        //       `${process.env.VUE_APP_BASE_API_URL}/users/logout`,
        //       {},
        //       myHeaders
        //     );
        //   } catch (error) {
        //     console.log(error);
        //   }
        // }
        // const userId = await this.userService.getUserId();
        await Promise.all([
          this.cryptoService.clearKeys(),
          this.storageService.remove("cs_token")
          // this.folderService.clear(userId),
          // this.collectionService.clear(userId),

          // this.cipherService.clear(userId),
          // this.settingsService.clear(userId),
          // this.policyService.clear(userId),
          // this.tokenService.clearToken(),
          // this.userService.clear(),
        ]);
        try {
          await this.storageService.save("cs_token", msg.token);
          const store = await this.storageService.get("cs_store");
          let oldStoreParsed = {};
          if (typeof store === "object") {
            oldStoreParsed = store;
          }
          await this.storageService.save("cs_store", {
            ...oldStoreParsed,
            isLoggedIn: true
          });
          sendResponse({ success: true });
        } catch (e) {
          console.log(e);
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
        // console.log(msg.referrer);
        // if (msg.referrer == null || Utils.getHostname(vaultUrl) !== msg.referrer) {
        //     return;
        // }
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
              await this.storageService.save("cs_token", access_token);
              const store = await this.storageService.get("cs_store");
              let oldStoreParsed = {};
              if (typeof store === "object") {
                oldStoreParsed = store;
              }
              await this.storageService.save("cs_store", {
                ...oldStoreParsed,
                isLoggedIn: true
              });
              // console.log({
              //   ...oldStoreParsed,
              //   isLoggedIn: true
              // });
              sendResponse({ success: true });
            });
        } catch (e) {
          console.log(e);
        }
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
      case "loginWithGG":
        chrome.identity.launchWebAuthFlow(
          {
            url: create_auth_endpoint(),
            interactive: true
          },
          async function(redirect_url) {
            if (chrome.runtime.lastError) {
              console.log("chrome runtime error: ", chrome.runtime.lastError);
              // problem signing in
            } else {
              let access_token = redirect_url.substring(
                redirect_url.indexOf("access_token=") + 13
              );
              access_token = access_token.substring(
                0,
                access_token.indexOf("&")
              );
              chrome.runtime.sendMessage({
                command: "loginWithSuccess",
                access_token,
                provider: msg.provider,
                sender: "runtime"
              });
              sendResponse({
                msg: "success",
                access_token,
                provider: msg.provider
              });
            }
          }
        );
        break;
      case "loginWithFB":
        chrome.identity.launchWebAuthFlow(
          {
            url: create_fb_auth_endpoint(),
            interactive: true
          },
          function(redirect_url) {
            if (chrome.runtime.lastError) {
              console.log(chrome.runtime.lastError);
              // problem signing in
            } else {
              let access_token = redirect_url.substring(
                redirect_url.indexOf("access_token=") + 13
              );
              access_token = access_token.substring(
                0,
                access_token.indexOf("&")
              );
              chrome.runtime.sendMessage({
                command: "loginWithSuccess",
                access_token,
                provider: msg.provider
              });
              sendResponse({ msg: "success", access_token });
            }
          }
        );
        break;
      case "loginWithGithub":
        chrome.identity.launchWebAuthFlow(
          {
            url: create_github_auth_endpoint(),
            interactive: true
          },
          function(redirect_url) {
            if (chrome.runtime.lastError) {
              // problem signing in
              console.log(chrome.runtime.lastError);
            } else {
              let access_token = redirect_url.substring(
                redirect_url.indexOf("code=") + 5
              );
              access_token = access_token.substring(
                0,
                access_token.indexOf("&")
              );
              const url = `https://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${access_token}`;
              axios.post(url).then(result => {
                access_token = result.data.substring(
                  result.data.indexOf("access_token=") + 13
                );
                access_token = access_token.substring(
                  0,
                  access_token.indexOf("&")
                );
                chrome.runtime.sendMessage({
                  command: "loginWithSuccess",
                  access_token,
                  provider: msg.provider
                });
              });

              sendResponse({ msg: "success", access_token });
            }
          }
        );
        break;
      case "loginWithSuccess":
        console.log("test");
      default:
        break;
    }
  }

  private async autofillPage() {
    const totpCode = await this.autofillService.doAutoFill({
      cipher: this.main.loginToAutoFill,
      pageDetails: this.pageDetailsToAutoFill,
      fillNewPassword: true,
    });

    if (totpCode != null) {
      this.platformUtilsService.copyToClipboard(totpCode, { window: window });
    }

    // reset
    this.main.loginToAutoFill = null;
    this.pageDetailsToAutoFill = [];
  }

  private async checkOnInstalled() {
    setTimeout(async () => {
      if (this.onInstalledReason != null) {
        if (this.onInstalledReason === 'install') {
          const url = `${process.env.VUE_APP_ID_URL}/login?SERVICE_URL=${encodeURIComponent("/sso")}&SERVICE_SCOPE=pwdmanager&CLIENT=browser`;
          BrowserApi.createNewTab(url);
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

  private async generatePassword(tab, responseCommand, inputOptions) {
      const options = inputOptions
      if (!options.lowercase && !options.uppercase && !options.lowercase && !options.number && !options.special) {
        options.lowercase = true
      }
      const responseData: any = {};
      // const options = (await this.passwordGenerator.getOptions())[0];
      const password = await this.passwordGenerator.generatePassword(options);
      let passwordStrength: any = {}
      if (password) {
        passwordStrength =  this.passwordGenerator.passwordStrength(password, ['cystack']) || {}
      }
      responseData.password = password
      responseData.passwordStrength = passwordStrength
      await BrowserApi.tabSendMessageData(tab, responseCommand, responseData);
      this.platformUtilsService.copyToClipboard(password, { window: window });
      this.passwordGenerator.addHistory(password);
    }
}
