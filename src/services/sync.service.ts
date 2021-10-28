import {
  SyncCipherNotification,
  SyncFolderNotification,
  SyncSendNotification,
} from 'jslib-common/models/response/notificationResponse';
import {ProfileResponse} from "jslib-common/models/response/profileResponse";
import {FolderResponse} from "jslib-common/models/response/folderResponse";
import {CollectionDetailsResponse} from "jslib-common/models/response/collectionResponse";
import {CipherResponse} from "jslib-common/models/response/cipherResponse";
import {SendResponse} from "jslib-common/models/response/sendResponse";
import {DomainsResponse} from "jslib-common/models/response/domainsResponse";
import {PolicyResponse} from "jslib-common/models/response/policyResponse";

export abstract class SyncService {
  syncInProgress: boolean;

  getLastSync: () => Promise<Date>;
  setLastSync: (date: Date) => Promise<any>;
  fullSync: (forceSync: boolean, allowThrowOnError?: boolean) => Promise<boolean>;
  syncUpsertFolder: (notification: SyncFolderNotification, isEdit: boolean) => Promise<boolean>;
  syncDeleteFolder: (notification: SyncFolderNotification) => Promise<boolean>;
  syncUpsertCipher: (notification: SyncCipherNotification, isEdit: boolean) => Promise<boolean>;
  syncDeleteCipher: (notification: SyncFolderNotification) => Promise<boolean>;
  syncUpsertSend: (notification: SyncSendNotification, isEdit: boolean) => Promise<boolean>;
  syncDeleteSend: (notification: SyncSendNotification) => Promise<boolean>;
  syncProfile: (response: ProfileResponse) => Promise<boolean>;
  syncFolders: (userId: string, response: FolderResponse[]) => Promise<boolean>;
  syncCollections: (response: CollectionDetailsResponse[]) => Promise<boolean>;
  syncCiphers: (userId: string, response: CipherResponse[]) => Promise<boolean>;
  syncSends: (userId: string, response: SendResponse[]) => Promise<boolean>;
  syncSettings: (userId: string, response: DomainsResponse) => Promise<boolean>;
  syncPolicies: (response: PolicyResponse[]) => Promise<boolean>;
}
