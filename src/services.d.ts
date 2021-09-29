import { AuditService } from 'jslib-common/abstractions/audit.service';
import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { CollectionService } from 'jslib-common/abstractions/collection.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { ExportService } from 'jslib-common/abstractions/export.service';
import { FolderService } from 'jslib-common/abstractions/folder.service';
import { MessagingService } from 'jslib-common/abstractions/messaging.service';
import { PasswordGenerationService } from 'jslib-common/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { SyncService } from '@/services/sync.service';
import { UserService } from 'jslib-common/abstractions/user.service';
import BrowserMessagingService from '@/services/browserMessaging.service';
import { ConsoleLogService } from '@/services/consoleLog.service';
import { ConstantsService } from 'jslib-common/services/constants.service';
import { SearchService } from 'jslib-common/services/search.service';
import { StateService } from 'jslib-common/services/state.service';
import { PopupSearchService } from './popup-search.service';
import { PopupUtilsService } from './popup-utils.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';
import { BroadcasterService } from 'jslib-common/abstractions/broadcaster.service';

declare module "vue/types/vue" {
  interface Vue {
    $auditService: AuditService;
    $cipherService: CipherService;
    $collectionService: CollectionService;
    $cryptoService: CryptoService;
    $exportService: ExportService;
    $folderService: FolderService;
    $messagingService: MessagingService;
    $passwordGenerationService: PasswordGenerationService;
    $platformUtilsService: PlatformUtilsService;
    $storageService: StorageService;
    $syncService: SyncService;
    $userService: UserService;
    $browserMessagingService: BrowserMessagingService;
    $consoleLogService: ConsoleLogService;
    $constantsService: ConstantsService;
    $searchService: SearchService;
    $stateService: StateService;
    $popupSearchService: PopupSearchService;
    $popupUtilsService: PopupUtilsService;
    $vaultTimeoutService: VaultTimeoutService;
    $broadcasterService: BroadcasterService;
  }

  interface VueConstructor {
    $auditService: AuditService;
    $cipherService: CipherService;
    $collectionService: CollectionService;
    $cryptoService: CryptoService;
    $exportService: ExportService;
    $folderService: FolderService;
    $messagingService: MessagingService;
    $passwordGenerationService: PasswordGenerationService;
    $platformUtilsService: PlatformUtilsService;
    $storageService: StorageService;
    $syncService: SyncService;
    $userService: UserService;
    $browserMessagingService: BrowserMessagingService;
    $consoleLogService: ConsoleLogService;
    $constantsService: ConstantsService;
    $searchService: SearchService;
    $stateService: StateService;
    $popupSearchService: PopupSearchService;
    $popupUtilsService: PopupUtilsService;
    $vaultTimeoutService: VaultTimeoutService;
    $broadcasterService: BroadcasterService;
  }
}

