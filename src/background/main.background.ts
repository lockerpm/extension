import { CipherRepromptType } from 'jslib-common/enums/cipherRepromptType';
import { CipherType } from 'jslib-common/enums/cipherType';

import { CipherView } from 'jslib-common/models/view/cipherView';

import { ApiService } from 'jslib-common/services/api.service';
import { AppIdService } from 'jslib-common/services/appId.service';
import { AuditService } from 'jslib-common/services/audit.service';
import { AuthService } from 'jslib-common/services/auth.service';
import { CipherService } from 'jslib-common/services/cipher.service';
import { CollectionService } from 'jslib-common/services/collection.service';
import { ConsoleLogService } from '@/services/consoleLog.service';
import { ConstantsService } from 'jslib-common/services/constants.service';
import { ContainerService } from 'jslib-common/services/container.service';
import { EnvironmentService } from 'jslib-common/services/environment.service';
import { EventService } from 'jslib-common/services/event.service';
import { ExportService } from 'jslib-common/services/export.service';
import { FileUploadService } from 'jslib-common/services/fileUpload.service';
import { FolderService } from 'jslib-common/services/folder.service';
import { NotificationsService } from 'jslib-common/services/notifications.service';
import { PassService } from 'jslib-common/services/pass.service';
import { PasswordGenerationService } from '@/services/passwordGeneration.service';
import { ImportService } from 'jslib-common/services/import.service';
import { PolicyService } from 'jslib-common/services/policy.service';
import { SearchService } from 'jslib-common/services/search.service';
import { SendService } from 'jslib-common/services/send.service';
import { SettingsService } from 'jslib-common/services/settings.service';
import { StateService } from 'jslib-common/services/state.service';
import { SyncService } from 'jslib-common/services/sync.service';
import { SystemService } from 'jslib-common/services/system.service';
import { TokenService } from 'jslib-common/services/token.service';
import { TotpService } from 'jslib-common/services/totp.service';
import { UserService } from 'jslib-common/services/user.service';
import { WebCryptoFunctionService } from 'jslib-common/services/webCryptoFunction.service';

import { ApiService as ApiServiceAbstraction } from 'jslib-common/abstractions/api.service';
import { AppIdService as AppIdServiceAbstraction } from 'jslib-common/abstractions/appId.service';
import { AuditService as AuditServiceAbstraction } from 'jslib-common/abstractions/audit.service';
import { AuthService as AuthServiceAbstraction } from 'jslib-common/abstractions/auth.service';
import { CipherService as CipherServiceAbstraction } from 'jslib-common/abstractions/cipher.service';
import { CollectionService as CollectionServiceAbstraction } from 'jslib-common/abstractions/collection.service';
import { CryptoService as CryptoServiceAbstraction } from 'jslib-common/abstractions/crypto.service';
import { CryptoFunctionService as CryptoFunctionServiceAbstraction } from 'jslib-common/abstractions/cryptoFunction.service';
import { EnvironmentService as EnvironmentServiceAbstraction } from 'jslib-common/abstractions/environment.service';
import { EventService as EventServiceAbstraction } from 'jslib-common/abstractions/event.service';
import { ExportService as ExportServiceAbstraction } from 'jslib-common/abstractions/export.service';
import { FileUploadService as FileUploadServiceAbstraction } from 'jslib-common/abstractions/fileUpload.service';
import { FolderService as FolderServiceAbstraction } from 'jslib-common/abstractions/folder.service';
import { I18nService as I18nServiceAbstraction } from 'jslib-common/abstractions/i18n.service';
import { LogService as LogServiceAbstraction } from 'jslib-common/abstractions/log.service';
import { MessagingService as MessagingServiceAbstraction } from 'jslib-common/abstractions/messaging.service';
import { NotificationsService as NotificationsServiceAbstraction } from 'jslib-common/abstractions/notifications.service';
import { PassService as PassServiceAbstraction } from 'jslib-common/abstractions/pass.service';
import { PasswordGenerationService as PasswordGenerationServiceAbstraction } from 'jslib-common/abstractions/passwordGeneration.service';
import { ImportService as ImportServiceAbstraction } from 'jslib-common/abstractions/import.service';
import { PlatformUtilsService as PlatformUtilsServiceAbstraction } from 'jslib-common/abstractions/platformUtils.service';
import { PolicyService as PolicyServiceAbstraction } from 'jslib-common/abstractions/policy.service';
import { SearchService as SearchServiceAbstraction } from 'jslib-common/abstractions/search.service';
import { SendService as SendServiceAbstraction } from 'jslib-common/abstractions/send.service';
import { SettingsService as SettingsServiceAbstraction } from 'jslib-common/abstractions/settings.service';
import { StateService as StateServiceAbstraction } from 'jslib-common/abstractions/state.service';
import { StorageService as StorageServiceAbstraction } from 'jslib-common/abstractions/storage.service';
import { SyncService as SyncServiceAbstraction } from 'jslib-common/abstractions/sync.service';
import { SystemService as SystemServiceAbstraction } from 'jslib-common/abstractions/system.service';
import { TokenService as TokenServiceAbstraction } from 'jslib-common/abstractions/token.service';
import { TotpService as TotpServiceAbstraction } from 'jslib-common/abstractions/totp.service';
import { UserService as UserServiceAbstraction } from 'jslib-common/abstractions/user.service';
import { VaultTimeoutService as VaultTimeoutServiceAbstraction } from 'jslib-common/abstractions/vaultTimeout.service';
import { AutofillService as AutofillServiceAbstraction } from '../services/abstractions/autofill.service';

import { BrowserApi } from '../browser/browserApi';
import { SafariApp } from '../browser/safariApp';

import CommandsBackground from './commands.background';
import ContextMenusBackground from './contextMenus.background';
import IdleBackground from './idle.background';
import { NativeMessagingBackground } from './nativeMessaging.background';
import NotificationBackground from './notification.background';
import RuntimeBackground from './runtime.background';
import TabsBackground from './tabs.background';
import WebRequestBackground from './webRequest.background';
import WindowsBackground from './windows.background';
import RequestBackground from './request.backgroud';

import { PopupUtilsService } from '../popup/services/popup-utils.service';
import AutofillService from '../services/autofill.service';
import { BrowserCryptoService } from '../services/browserCrypto.service';
import BrowserMessagingService from '../services/browserMessaging.service';
import BrowserPlatformUtilsService from '../services/browserPlatformUtils.service';
import BrowserStorageService from '../services/browserStorage.service';
import I18nService from '../services/i18n.service';
import VaultTimeoutService from '../services/vaultTimeout.service';

const win = window ?? self

export default class MainBackground {
  messagingService: MessagingServiceAbstraction;
  storageService: StorageServiceAbstraction;
  secureStorageService: StorageServiceAbstraction;
  i18nService: I18nServiceAbstraction;
  platformUtilsService: PlatformUtilsServiceAbstraction;
  constantsService: ConstantsService;
  logService: LogServiceAbstraction;
  cryptoService: CryptoServiceAbstraction;
  cryptoFunctionService: CryptoFunctionServiceAbstraction;
  tokenService: TokenServiceAbstraction;
  appIdService: AppIdServiceAbstraction;
  apiService: ApiServiceAbstraction;
  environmentService: EnvironmentServiceAbstraction;
  userService: UserServiceAbstraction;
  settingsService: SettingsServiceAbstraction;
  cipherService: CipherServiceAbstraction;
  folderService: FolderServiceAbstraction;
  collectionService: CollectionServiceAbstraction;
  vaultTimeoutService: VaultTimeoutServiceAbstraction;
  syncService: SyncServiceAbstraction;
  passService: PassServiceAbstraction;
  passwordGenerationService: PasswordGenerationServiceAbstraction;
  importService: ImportServiceAbstraction;
  totpService: TotpServiceAbstraction;
  autofillService: AutofillServiceAbstraction;
  containerService: ContainerService;
  auditService: AuditServiceAbstraction;
  authService: AuthServiceAbstraction;
  exportService: ExportServiceAbstraction;
  searchService: SearchServiceAbstraction;
  notificationsService: NotificationsServiceAbstraction;
  stateService: StateServiceAbstraction;
  systemService: SystemServiceAbstraction;
  eventService: EventServiceAbstraction;
  policyService: PolicyServiceAbstraction;
  popupUtilsService: PopupUtilsService;
  sendService: SendServiceAbstraction;
  fileUploadService: FileUploadServiceAbstraction;

  onUpdatedRan: boolean;
  onReplacedRan: boolean;
  loginToAutoFill: CipherView = null;

  private commandsBackground: CommandsBackground;
  private contextMenusBackground: ContextMenusBackground;
  private idleBackground: IdleBackground;
  private notificationBackground: NotificationBackground;
  private runtimeBackground: RuntimeBackground;
  private tabsBackground: TabsBackground;
  private webRequestBackground: WebRequestBackground;
  private windowsBackground: WindowsBackground;
  private requestBackground: RequestBackground;

  private sidebarAction: any;
  private buildingContextMenu: boolean;
  private menuOptionsLoaded: any[] = [];
  private syncTimeout: any;
  private isSafari: boolean;
  private nativeMessagingBackground: NativeMessagingBackground;

  constructor() {
    // Services
    this.messagingService = new BrowserMessagingService();
    this.storageService = new BrowserStorageService();
    this.platformUtilsService = new BrowserPlatformUtilsService(this.messagingService, this.storageService,
      (clipboardValue, clearMs) => {
        if (this.systemService) {
          this.systemService.clearClipboard(clipboardValue, clearMs);
        }
      },
      async () => {
        if (this.nativeMessagingBackground) {
          const promise = this.nativeMessagingBackground.getResponse();

          try {
            await this.nativeMessagingBackground.send({ command: 'biometricUnlock' });
          } catch (e) {
            return Promise.reject(e);
          }

          return promise.then(result => result.response === 'unlocked');
        }
      });
    this.secureStorageService = new BrowserStorageService();
    this.i18nService = new I18nService(BrowserApi.getUILanguage());
    this.cryptoFunctionService = new WebCryptoFunctionService(win, this.platformUtilsService);
    this.logService = new ConsoleLogService(false);
    this.cryptoService = new BrowserCryptoService(this.storageService, this.secureStorageService,
      this.cryptoFunctionService, this.platformUtilsService, this.logService);
    this.tokenService = new TokenService(this.storageService);
    this.appIdService = new AppIdService(this.storageService);
    this.environmentService = new EnvironmentService(this.storageService);
    this.apiService = new ApiService(this.tokenService, this.platformUtilsService, this.environmentService,
      (expired: boolean) => this.logout(expired));
    this.userService = new UserService(this.tokenService, this.storageService);
    this.settingsService = new SettingsService(this.userService, this.storageService);
    this.fileUploadService = new FileUploadService(this.logService, this.apiService);
    this.cipherService = new CipherService(this.cryptoService, this.userService, this.settingsService,
      this.apiService, this.fileUploadService, this.storageService, this.i18nService, () => this.searchService, this.platformUtilsService,
      this.logService);
    this.folderService = new FolderService(this.cryptoService, this.userService, this.apiService,
      this.storageService, this.i18nService, this.cipherService);
    this.collectionService = new CollectionService(this.cryptoService, this.userService, this.storageService,
      this.i18nService);
    this.searchService = new SearchService(this.cipherService, this.logService, this.i18nService);
    this.sendService = new SendService(this.cryptoService, this.userService, this.apiService, this.fileUploadService,
      this.storageService, this.i18nService, this.cryptoFunctionService);
    this.stateService = new StateService();
    this.policyService = new PolicyService(this.userService, this.storageService, this.apiService);
    this.vaultTimeoutService = new VaultTimeoutService(this.cipherService, this.folderService,
      this.collectionService, this.cryptoService, this.platformUtilsService, this.storageService,
      this.messagingService, this.searchService, this.userService, this.tokenService, this.policyService,
      async () => {
        if (this.notificationsService) {
          this.notificationsService.updateConnection(false);
        }
        await this.setIcon();
        await this.refreshBadgeAndMenu(true);
        if (this.systemService) {
          this.systemService.startProcessReload();
          await this.systemService.clearPendingClipboard();
        }
      }, async () => await this.logout(false));
    this.syncService = new SyncService(this.userService, this.apiService, this.settingsService,
      this.folderService, this.cipherService, this.cryptoService, this.collectionService,
      this.storageService, this.messagingService, this.policyService, this.sendService,
      this.logService, async (expired: boolean) => await this.logout(expired));
    this.eventService = new EventService(this.storageService, this.apiService, this.userService,
      this.cipherService, this.logService);
    this.passService = new PassService(this.storageService);
    this.passwordGenerationService = new PasswordGenerationService(this.cryptoService, this.storageService,
      this.policyService);
    this.totpService = new TotpService(this.storageService, this.cryptoFunctionService, this.logService);
    this.autofillService = new AutofillService(this.cipherService, this.userService, this.totpService,
      this.eventService);
    this.containerService = new ContainerService(this.cryptoService);
    this.auditService = new AuditService(this.cryptoFunctionService, this.apiService);
    this.exportService = new ExportService(this.folderService, this.cipherService, this.apiService,
      this.cryptoService);
    this.importService = new ImportService(this.cipherService, this.folderService, this.apiService, this.i18nService, this.collectionService,
      this.platformUtilsService, this.cryptoService);
    this.notificationsService = new NotificationsService(this.userService, this.syncService, this.appIdService,
      this.apiService, this.vaultTimeoutService, this.environmentService, () => this.logout(true), this.logService);
    this.popupUtilsService = new PopupUtilsService(this.platformUtilsService);
    this.systemService = new SystemService(this.storageService, this.vaultTimeoutService,
      this.messagingService, this.platformUtilsService, () => {
        const forceWindowReload = this.platformUtilsService.isSafari() ||
          this.platformUtilsService.isFirefox() || this.platformUtilsService.isOpera();
        BrowserApi.reloadExtension(forceWindowReload ? win : null);
        return Promise.resolve();
      });

    // Other fields
    this.isSafari = this.platformUtilsService.isSafari();
    this.sidebarAction = this.isSafari ? null : (typeof opr !== 'undefined') && opr.sidebarAction ?
      opr.sidebarAction : (win as any).chrome?.sidebarAction;

    // Background
    this.requestBackground = new RequestBackground(this);
    this.runtimeBackground = new RuntimeBackground(this, this.autofillService,
      this.platformUtilsService as BrowserPlatformUtilsService, this.storageService, this.i18nService,
      this.notificationsService, this.systemService, this.environmentService, this.messagingService, this.cryptoService, this.cipherService, this.folderService, this.collectionService,
      this.userService, this.settingsService, this.policyService, this.tokenService, this.passwordGenerationService, this.passService, this.requestBackground, this.vaultTimeoutService);
    this.nativeMessagingBackground = new NativeMessagingBackground(this.storageService, this.cryptoService, this.cryptoFunctionService,
      this.vaultTimeoutService, this.runtimeBackground, this.i18nService, this.userService, this.messagingService, this.appIdService,
      this.platformUtilsService);
    this.commandsBackground = new CommandsBackground(this, this.passwordGenerationService,
      this.platformUtilsService, this.vaultTimeoutService);
    this.notificationBackground = new NotificationBackground(this, this.autofillService, this.cipherService,
      this.storageService, this.vaultTimeoutService, this.policyService, this.folderService, this.userService, this.totpService, this.requestBackground);

    this.tabsBackground = new TabsBackground(this, this.notificationBackground);
    this.contextMenusBackground = new ContextMenusBackground(this, this.cipherService, this.passwordGenerationService,
      this.platformUtilsService, this.vaultTimeoutService, this.eventService, this.totpService);
    this.idleBackground = new IdleBackground(this.vaultTimeoutService, this.storageService,
      this.notificationsService);
    this.webRequestBackground = new WebRequestBackground(this.platformUtilsService, this.cipherService,
      this.vaultTimeoutService);
    this.windowsBackground = new WindowsBackground(this);

    const that = this;
    this.authService = new AuthService(this.cryptoService, this.apiService, this.userService,
      this.tokenService, this.appIdService, this.i18nService, this.platformUtilsService,
      new class extends MessagingServiceAbstraction {
        // AuthService should send the messages to the background not popup.
        send = (subscriber: string, arg: any = {}) => {
          const message = Object.assign({}, { command: subscriber }, arg);
          that.runtimeBackground.processMessage(message, that, null);
        }
      }(), this.vaultTimeoutService, this.logService);
  }

  async bootstrap() {
    this.containerService.attachToWindow(win);

    (this.authService as AuthService).init();
    await (this.vaultTimeoutService as VaultTimeoutService).init(true);
    await (this.i18nService as I18nService).init();
    await (this.eventService as EventService).init(true);
    await this.runtimeBackground.init();
    await this.notificationBackground.init();
    await this.commandsBackground.init();

    await this.tabsBackground.init();
    await this.contextMenusBackground.init();
    await this.idleBackground.init();
    await this.webRequestBackground.init();
    await this.windowsBackground.init();

    return new Promise<void>(resolve => {
      setTimeout(async () => {
        await this.environmentService.setUrlsFromStorage();
        await this.setIcon();
        setTimeout(() => this.notificationsService.init(), 2500);
        resolve();
      }, 500);
    });
  }

  async setIcon() {
    if (!chrome.action && !this.sidebarAction) {
      return;
    }
    const isAuthenticated = await this.userService.isAuthenticated();
    const locked = await this.vaultTimeoutService.isLocked();

    let suffix = '';
    if (!isAuthenticated) {
      suffix = '_gray';
    } else if (locked) {
      suffix = '_locked';
    }

    await this.actionSetIcon(chrome.action, suffix);
    await this.actionSetIcon(this.sidebarAction, suffix);
  }

  async refreshBadgeAndMenu(forLocked: boolean = false) {
    if (!chrome.windows || !chrome.contextMenus) {
      return;
    }

    const menuDisabled = await this.storageService.get<boolean>(ConstantsService.disableContextMenuItemKey);
    if (!menuDisabled) {
      await this.buildContextMenu();
    } else {
      await this.contextMenusRemoveAll();
    }

    if (forLocked) {
      await this.loadMenuAndUpdateBadgeForNoAccessState(!menuDisabled);
      this.onUpdatedRan = this.onReplacedRan = false;
      return;
    }

    const tab = await BrowserApi.getTabFromCurrentWindow();
    if (tab) {
      await this.contextMenuReady(tab, !menuDisabled);
    }
  }

  async logout(expired: boolean) {
    await this.eventService.uploadEvents();
    const userId = await this.userService.getUserId();

    await this.passService.clearGeneratePassword();

    await Promise.all([
      this.eventService.clearEvents(),
      this.syncService.setLastSync(new Date(0)),
      this.tokenService.clearToken(),
      this.cryptoService.clearKeys(),
      this.userService.clear(),
      this.settingsService.clear(userId),
      this.cipherService.clear(userId),
      this.folderService.clear(userId),
      this.collectionService.clear(userId),
      this.policyService.clear(userId),
      this.passwordGenerationService.clear(),
      this.vaultTimeoutService.clear(),
      this.storageService.remove("cs_token"),
    ]);

    this.searchService.clearIndex();
    this.messagingService.send('doneLoggingOut', { expired: expired });

    await this.runtimeBackground.updateStoreService('isLoggedIn', false)

    await this.setIcon();
    await this.refreshBadgeAndMenu();
    await this.reseedStorage();

    this.notificationsService.updateConnection(false);
    this.systemService.startProcessReload();
    await this.systemService.clearPendingClipboard();
  }

  async collectPageDetailsForContentScript(tab: any, sender: string, frameId: number = null) {
    if (!tab || !tab.id) {
      return;
    }

    const options: any = {};
    if (frameId) {
      options.frameId = frameId;
    }
    BrowserApi.tabSendMessage(tab, {
      command: 'collectPageDetails',
      tab: tab,
      sender: sender
    }, options);
  }

  async openPopup() {
    // Chrome APIs cannot open popup

    // TODO: Do we need to open this popup?
    if (this.platformUtilsService.isFirefox()) {
      browser.browserAction.openPopup();
      return;
    }
    if (!this.isSafari) {
      return;
    }
    await SafariApp.sendMessageToApp('showPopover', null, true);
  }

  async reseedStorage() {
    if (!this.platformUtilsService.isChrome() && !this.platformUtilsService.isVivaldi() &&
      !this.platformUtilsService.isOpera()) {
      return;
    }

    const currentVaultTimeout = await this.storageService.get<number>(ConstantsService.vaultTimeoutKey);
    if (!currentVaultTimeout) {
      return;
    }

    const getStorage = (): Promise<any> => new Promise(resolve => {
      chrome.storage.local.get(null, (o: any) => resolve(o));
    });

    const clearStorage = (): Promise<void> => new Promise(resolve => {
      chrome.storage.local.clear(() => resolve());
    });

    const storage = await getStorage();
    await clearStorage();

    for (const key in storage) {
      if (!storage.hasOwnProperty(key)) {
        continue;
      }
      await this.storageService.save(key, storage[key]);
    }
  }

  private async buildContextMenu() {
    if (!chrome.contextMenus || this.buildingContextMenu) {
      return;
    }

    this.buildingContextMenu = true;
    await this.contextMenusRemoveAll();

    await this.contextMenusCreate({
      type: 'normal',
      id: 'root',
      contexts: ['all'],
      title: 'Locker',
    });

    await this.contextMenusCreate({
      type: 'normal',
      id: 'autofill',
      parentId: 'root',
      contexts: ['all'],
      title: this.i18nService.t('autoFill'),
    });

    await this.contextMenusCreate({
      type: 'normal',
      id: 'copy-username',
      parentId: 'root',
      contexts: ['all'],
      title: this.i18nService.t('copyUsername'),
    });

    await this.contextMenusCreate({
      type: 'normal',
      id: 'copy-password',
      parentId: 'root',
      contexts: ['all'],
      title: this.i18nService.t('copyPassword'),
    });

    await this.contextMenusCreate({
      type: 'separator',
      parentId: 'root',
    });

    await this.contextMenusCreate({
      type: 'normal',
      id: 'generate-password',
      parentId: 'root',
      contexts: ['all'],
      title: this.i18nService.t('generatePasswordCopied'),
    });

    await this.contextMenusCreate({
      type: 'normal',
      id: 'copy-identifier',
      parentId: 'root',
      contexts: ['all'],
      title: this.i18nService.t('copyElementIdentifier'),
    });

    this.buildingContextMenu = false;
  }

  private async contextMenuReady(tab: any, contextMenuEnabled: boolean) {
    await this.loadMenuAndUpdateBadge(tab.url, tab.id, contextMenuEnabled);
    this.onUpdatedRan = this.onReplacedRan = false;
  }

  private async loadMenuAndUpdateBadge(url: string, tabId: number, contextMenuEnabled: boolean) {
    if (!url || (!chrome.action && !this.sidebarAction)) {
      return;
    }
    this.actionSetBadgeBackgroundColor(chrome.action);
    this.actionSetBadgeBackgroundColor(this.sidebarAction);

    this.menuOptionsLoaded = [];
    const locked = await this.vaultTimeoutService.isLocked();
    await this.browserActionSetIcon(tabId, locked);
    if (!locked) {
      try {
        setTimeout(async () => {
          const ciphers = await this.cipherService.getAllDecryptedForUrl(url);
          ciphers.sort((a, b) => this.cipherService.sortCiphersByLastUsedThenName(a, b));
          if (contextMenuEnabled) {
            ciphers.forEach(cipher => {
              this.loadLoginContextMenuOptions(cipher);
            });
          }

          const disableBadgeCounter = await this.storageService.get<boolean>(ConstantsService.disableBadgeCounterKey);
          let theText = '';

          if (!disableBadgeCounter) {
            if (ciphers.length > 0 && ciphers.length <= 9) {
              theText = ciphers.length.toString();
            } else if (ciphers.length > 0) {
              theText = '9+';
            }
          }

          if (contextMenuEnabled && ciphers.length === 0) {
            await this.loadNoLoginsContextMenuOptions(this.i18nService.t('noMatchingLogins'));
          }

          await this.sidebarActionSetBadgeText(theText, tabId);
          await this.browserActionSetBadgeText(theText, tabId);
        }, 1000);
        return;
      } catch { }
    }
    await this.loadMenuAndUpdateBadgeForNoAccessState(contextMenuEnabled);
  }

  private async loadMenuAndUpdateBadgeForNoAccessState(contextMenuEnabled: boolean) {
    if (contextMenuEnabled) {
      const authed = await this.userService.isAuthenticated();
      await this.loadNoLoginsContextMenuOptions(this.i18nService.t(authed ? 'vaultLocked' : 'vaultLoggedOut'));
    }

    const tabs = await BrowserApi.getActiveTabs();
    if (tabs) {
      tabs.forEach(tab => {
        if (tab.id) {
          this.browserActionSetBadgeText('', tab.id);
          this.sidebarActionSetBadgeText('', tab.id);
        }
      });
    }
  }

  private async loadLoginContextMenuOptions(cipher: any) {
    if (!cipher || cipher.type !== CipherType.Login || cipher.reprompt !== CipherRepromptType.None) {
      return;
    }

    let title = cipher.name;
    if (cipher.login.username) {
      title += (' (' + cipher.login.username + ')');
    }
    await this.loadContextMenuOptions(title, cipher.id, cipher);
  }

  private async loadNoLoginsContextMenuOptions(noLoginsMessage: string) {
    await this.loadContextMenuOptions(noLoginsMessage, 'noop', null);
  }

  private async loadContextMenuOptions(title: string, idSuffix: string, cipher: any) {
    if (!chrome.contextMenus || this.menuOptionsLoaded.indexOf(idSuffix) > -1 ||
      (cipher && cipher.type !== CipherType.Login)) {
      return;
    }

    this.menuOptionsLoaded.push(idSuffix);

    if (!cipher || (cipher.login.password && cipher.login.password !== '')) {
      await this.contextMenusCreate({
        type: 'normal',
        id: 'autofill_' + idSuffix,
        parentId: 'autofill',
        contexts: ['all'],
        title: this.sanitizeContextMenuTitle(title),
      });
    }

    if (!cipher || (cipher.login.username && cipher.login.username !== '')) {
      await this.contextMenusCreate({
        type: 'normal',
        id: 'copy-username_' + idSuffix,
        parentId: 'copy-username',
        contexts: ['all'],
        title: this.sanitizeContextMenuTitle(title),
      });
    }

    if (!cipher || (cipher.login.password && cipher.login.password !== '' && cipher.viewPassword)) {
      await this.contextMenusCreate({
        type: 'normal',
        id: 'copy-password_' + idSuffix,
        parentId: 'copy-password',
        contexts: ['all'],
        title: this.sanitizeContextMenuTitle(title),
      });
    }

    const canAccessPremium = await this.userService.canAccessPremium();
    if (canAccessPremium && (!cipher || (cipher.login.totp && cipher.login.totp !== ''))) {
      await this.contextMenusCreate({
        type: 'normal',
        id: 'copy-totp_' + idSuffix,
        parentId: 'copy-totp',
        contexts: ['all'],
        title: this.sanitizeContextMenuTitle(title),
      });
    }
  }

  private sanitizeContextMenuTitle(title: string): string {
    return title.replace(/&/g, '&&');
  }

  // Browser API Helpers
  private contextMenusRemoveAll() {
    return new Promise<void>(resolve => {
      chrome.contextMenus.removeAll(() => {
        resolve();
        if (chrome.runtime.lastError) {
          return;
        }
      });
    });
  }

  private contextMenusCreate(options: any) {
    return new Promise<void>(resolve => {
      chrome.contextMenus.create(options, () => {
        resolve();
        if (chrome.runtime.lastError) {
          return;
        }
      });
    });
  }

  private async actionSetIcon(theAction: any, suffix: string): Promise<any> {
    if (!theAction || !theAction.setIcon) {
      return;
    }

    const options = {
      path: {
        19: 'icons/19' + '.png',
        38: 'icons/38' + '.png',
      }
    };

    if (this.platformUtilsService.isFirefox()) {
      await theAction.setIcon(options);
    } else if (this.platformUtilsService.isSafari()) {
      theAction.setIcon(options);
    } else {
      return new Promise<void>(resolve => {
        theAction.setIcon(options, () => resolve());
      });
    }
  }

  private actionSetBadgeBackgroundColor(action: any) {
    if (action && action.setBadgeBackgroundColor) {
      action.setBadgeBackgroundColor({ color: '#294e5f' });
    }
  }

  private async browserActionSetBadgeText(text: string, tabId: number) {
    if (chrome.action && chrome.action.setBadgeText) {
      await chrome.action.setBadgeText({
        text: text,
        tabId: tabId,
      });
    }
  }

  private async browserActionSetIcon(tabId: number, locked: boolean) {
    if (chrome.action && chrome.action.setIcon) {
      await chrome.action.setIcon({
        path: locked ? "icons/locked.png" : 'icons/19.png',
        tabId: tabId,
      });
    }
  }

  private async sidebarActionSetBadgeText(text: string, tabId: number) {
    if (!this.sidebarAction) {
      return;
    }
    if (this.sidebarAction.setBadgeText) {
      await this.sidebarAction.setBadgeText({
        text: text,
        tabId: tabId,
      });
    } else if (this.sidebarAction.setTitle) {
      let title = 'Locker';
      if (text && text !== '') {
        title += (' [' + text + ']');
      }

      await this.sidebarAction.setTitle({
        title: title,
        tabId: tabId,
      });
    }
  }
}
