/* eslint-disabled */

import { BrowserApi } from '@/browser/browserApi';

import { ApiService } from 'jslib-common/abstractions/api.service';
import { AppIdService } from 'jslib-common/abstractions/appId.service';
import { AuditService } from 'jslib-common/abstractions/audit.service';
import { AuthService as AuthServiceAbstraction } from 'jslib-common/abstractions/auth.service';
import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { CollectionService } from 'jslib-common/abstractions/collection.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { CryptoFunctionService } from 'jslib-common/abstractions/cryptoFunction.service';
import { EnvironmentService } from 'jslib-common/abstractions/environment.service';
import { EventService } from 'jslib-common/abstractions/event.service';
import { ExportService } from 'jslib-common/abstractions/export.service';
import { FileUploadService } from 'jslib-common/abstractions/fileUpload.service';
import { FolderService } from 'jslib-common/abstractions/folder.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { LogService as LogServiceAbstraction } from 'jslib-common/abstractions/log.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { NotificationsService } from 'jslib-common/abstractions/notifications.service';
import { PasswordGenerationService } from 'jslib-common/abstractions/passwordGeneration.service';
import { PasswordRepromptService as PasswordRepromptServiceAbstraction } from 'jslib-common/abstractions/passwordReprompt.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { PolicyService } from 'jslib-common/abstractions/policy.service';
import { SearchService as SearchServiceAbstraction } from 'jslib-common/abstractions/search.service';
import { SendService } from 'jslib-common/abstractions/send.service';
import { SettingsService } from 'jslib-common/abstractions/settings.service';
import { StateService as StateServiceAbstraction } from 'jslib-common/abstractions/state.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { SyncService } from 'jslib-common/abstractions/sync.service';
import { TokenService } from 'jslib-common/abstractions/token.service';
import { TotpService } from 'jslib-common/abstractions/totp.service';
import { UserService } from 'jslib-common/abstractions/user.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';

import { AutofillService } from '@/services/abstractions/autofill.service';
import BrowserMessagingService from '@/services/browserMessaging.service';

import { AuthService } from 'jslib-common/services/auth.service';
import { ConsoleLogService } from '@/services/consoleLog.service';
import { ConstantsService } from 'jslib-common/services/constants.service';
import { SearchService } from 'jslib-common/services/search.service';
import { StateService } from 'jslib-common/services/state.service';

import { PopupSearchService } from './popup-search.service';
import { PopupUtilsService } from './popup-utils.service';
import {ContainerService} from "jslib-common/services/container.service";

function getBgService<T>(service: string) {
    return (): T => {
        const page = BrowserApi.getBackgroundPage();
        return page ? page.bitwardenMain[service] as T : null;
    };
}

const isPrivateMode = BrowserApi.getBackgroundPage() == null;

const stateService = new StateService();
const messagingService = new BrowserMessagingService();
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
        Vue.prototype.$searchService =  getBgService<SearchService>('searchService')()
        Vue.prototype.$platformUtilsService =  platformUtilsService
        Vue.prototype.$messagingService =  getBgService<MessagingService>('messagingService')()
        Vue.prototype.$folderService =  getBgService<FolderService>('folderService')()
        Vue.prototype.$collectionService =  getBgService<CollectionService>('collectionService')()
        Vue.prototype.$passwordGenerationService =  getBgService<PasswordGenerationService>('passwordGenerationService')()
        Vue.prototype.$storageService =  storageService
        Vue.prototype.$exportService =  getBgService<ExportService>('exportService')()
        Vue.prototype.$auditService =  getBgService<AuditService>('auditService')()

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
