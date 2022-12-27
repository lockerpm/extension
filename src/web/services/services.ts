/* eslint-disabled */

import { BrowserApi } from '@/browser/browserApi';

import { AuditService } from 'jslib-common/abstractions/audit.service';
import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { CollectionService } from 'jslib-common/abstractions/collection.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { ExportService } from 'jslib-common/abstractions/export.service';
import { ImportService } from 'jslib-common/abstractions/import.service';
import { FolderService } from 'jslib-common/abstractions/folder.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { PassService } from 'jslib-common/abstractions/pass.service';
import { PasswordGenerationService } from 'jslib-common/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { SyncService } from 'jslib-common/abstractions/sync.service';
import { UserService } from 'jslib-common/abstractions/user.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';
import { BroadcasterService } from 'jslib-common/abstractions/broadcaster.service';

import { ConsoleLogService } from '@/services/consoleLog.service';
import { ConstantsService } from 'jslib-common/services/constants.service';
import { SearchService } from 'jslib-common/services/search.service';
import { StateService } from 'jslib-common/services/state.service';

import { PopupSearchService } from './popup-search.service';
import { PopupUtilsService } from './popup-utils.service';

function getBgService<T>(service: string) {
  return (): T => {
    const page = BrowserApi.getBackgroundPage();
    return page ? page.bitwardenMain[service] as T : null;
  };
}

const isPrivateMode = BrowserApi.getBackgroundPage() == null;

const stateService = new StateService();
const searchService = isPrivateMode ? null : new PopupSearchService(getBgService<SearchService>('searchService')(),
  getBgService<CipherService>('cipherService')(), getBgService<ConsoleLogService>('consoleLogService')(),
  getBgService<I18nService>('i18nService')());

export default {
  // called by Vue.use(FirstPlugin)
  async install(Vue, options) {
    const platformUtilsService = getBgService<PlatformUtilsService>('platformUtilsService')()
    const i18nService = getBgService<I18nService>('i18nService')()
    const storageService = getBgService<StorageService>('storageService')()
    const popupUtilsService = getBgService<PopupUtilsService>('popupUtilsService')()

    Vue.prototype.$cryptoService =  getBgService<CryptoService>('cryptoService')()
    Vue.prototype.$cipherService =  getBgService<CipherService>('cipherService')()
    Vue.prototype.$userService =  getBgService<UserService>('userService')()
    Vue.prototype.$syncService =  getBgService<SyncService>('syncService')()
    Vue.prototype.$tokenService =  getBgService<SyncService>('tokenService')()
    Vue.prototype.$searchService =  searchService
    Vue.prototype.$platformUtilsService =  platformUtilsService
    Vue.prototype.$messagingService =  getBgService<MessagingService>('messagingService')()
    Vue.prototype.$folderService =  getBgService<FolderService>('folderService')()
    Vue.prototype.$collectionService =  getBgService<CollectionService>('collectionService')()
    Vue.prototype.$passService =  getBgService<PassService>('passService')()
    Vue.prototype.$passwordGenerationService =  getBgService<PasswordGenerationService>('passwordGenerationService')()
    Vue.prototype.$storageService =  storageService
    Vue.prototype.$exportService =  getBgService<ExportService>('exportService')()
    Vue.prototype.$importService =  getBgService<ImportService>('importService')()
    Vue.prototype.$auditService =  getBgService<AuditService>('auditService')()
    Vue.prototype.$vaultTimeoutService =  getBgService<VaultTimeoutService>('vaultTimeoutService')()
    Vue.prototype.$broadcasterService =  getBgService<BroadcasterService>('broadcasterService')()

    if (!popupUtilsService.inPopup(window)) {
      window.document.body.classList.add('body-full');
    } else if (window.screen.availHeight < 600) {
      window.document.body.classList.add('body-xs');
    } else if (window.screen.availHeight <= 800) {
      window.document.body.classList.add('body-sm');
    }

    if (!isPrivateMode) {
      await stateService.save(ConstantsService.disableFaviconKey,
        await storageService.get<boolean>(ConstantsService.disableFaviconKey));

      await stateService.save(ConstantsService.disableBadgeCounterKey,
        await storageService.get<boolean>(ConstantsService.disableBadgeCounterKey));

      let theme = await storageService.get<string>(ConstantsService.themeKey);
      if (theme == null) {
        theme = await platformUtilsService.getDefaultSystemTheme();

        platformUtilsService.onDefaultSystemThemeChange(sysTheme => {
          window.document.documentElement.classList.remove('theme_light', 'theme_dark');
          window.document.documentElement.classList.add('theme_' + sysTheme);
        });
      }
      window.document.documentElement.classList.add('locale_' + i18nService.translationLocale);
      window.document.documentElement.classList.add('theme_' + theme);
    }
  },
  getBgService
}
