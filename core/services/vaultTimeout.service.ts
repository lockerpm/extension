import { ConstantsService } from './constants.service';

import { CipherService } from '../abstractions/cipher.service';
import { CollectionService } from '../abstractions/collection.service';
import { CryptoService } from '../abstractions/crypto.service';
import { FolderService } from '../abstractions/folder.service';
import { MessagingService } from '../abstractions/messaging.service';
import { PlatformUtilsService } from '../abstractions/platformUtils.service';
import { PolicyService } from '../abstractions/policy.service';
import { SearchService } from '../abstractions/search.service';
import { StorageService } from '../abstractions/storage.service';
import { TokenService } from '../abstractions/token.service';
import { UserService } from '../abstractions/user.service';
import { VaultTimeoutService as VaultTimeoutServiceAbstraction } from '../abstractions/vaultTimeout.service';

import { PolicyType } from '../enums/policyType';
import { EncString } from '../models/domain/encString';

export class VaultTimeoutService implements VaultTimeoutServiceAbstraction {
    pinProtectedKey: EncString = null;
    biometricLocked: boolean = true;
    everBeenUnlocked: boolean = false;

    constructor(private cipherService: CipherService, private folderService: FolderService,
        private collectionService: CollectionService, private cryptoService: CryptoService,
        protected platformUtilsService: PlatformUtilsService, private storageService: StorageService,
        private messagingService: MessagingService, private searchService: SearchService,
        private userService: UserService, private tokenService: TokenService, private policyService: PolicyService,
        private lockedCallback: () => Promise<void> = null, private loggedOutCallback: () => Promise<void> = null) {
    }

    async init(checkOnInterval: boolean) {
        this.startCheck();        
    }

    startCheck() {
        this.checkVaultTimeout();
        setInterval(() => this.checkVaultTimeout(), 100);
    }

    // Keys aren't stored for a device that is locked or logged out.
    async isLocked(): Promise<boolean> {
        if (await this.cryptoService.hasKeyStored('auto') && !this.everBeenUnlocked) {
            await this.cryptoService.getKey('auto');
        }

        return !(await this.cryptoService.hasKeyInMemory());
    }

    async checkVaultTimeout(): Promise<void> {
        // "is logged out check" - similar to isLocked, below
        const authed = await this.userService.isAuthenticated();
        if (!authed) {
            return;
        }

        if (await this.isLocked()) {
            return;
        }

        const vaultTimeout = await this.getVaultTimeout();
        
        if (!vaultTimeout || vaultTimeout < 0) {
          const windows = await chrome?.windows?.getAll() || null
          if (!windows || !windows.length || windows.length === 0) {
            await this.lock();
          }
          return;
        }

        const lastActive = await this.storageService.get<number>(ConstantsService.lastActiveKey);
        if (!lastActive) {
            return;
        }

        const vaultTimeoutSeconds = vaultTimeout * 60;
        
        const diffSeconds = ((new Date()).getTime() - lastActive) / 1000;

        if (diffSeconds >= vaultTimeoutSeconds) {
            const timeoutAction = await this.storageService.get<string>(ConstantsService.vaultTimeoutActionKey);
            timeoutAction === 'logOut' ? await this.logOut() : await this.lock();
        }
    }

    async lock(): Promise<void> {
        this.biometricLocked = true;
        this.everBeenUnlocked = true;
        if (this.lockedCallback != null) {
          await this.lockedCallback();
        }
    }

    async logOut(): Promise<void> {
        if (this.loggedOutCallback != null) {
            await this.loggedOutCallback();
        }
    }

    async setVaultTimeoutOptions(timeout: number, action: string): Promise<void> {
        await this.storageService.save(ConstantsService.vaultTimeoutKey, timeout);
        await this.storageService.save(ConstantsService.vaultTimeoutActionKey, action);
        await this.cryptoService.toggleKey();
        await this.tokenService.toggleTokens();
    }

    async isPinLockSet(): Promise<[boolean, boolean]> {
        const protectedPin = await this.storageService.get<string>(ConstantsService.protectedPin);
        const pinProtectedKey = await this.storageService.get<string>(ConstantsService.pinProtectedKey);
        return [protectedPin != null, pinProtectedKey != null];
    }

    async isBiometricLockSet(): Promise<boolean> {
        return await this.storageService.get<boolean>(ConstantsService.biometricUnlockKey);
    }

    async getVaultTimeout(): Promise<number> {
        const vaultTimeout = await this.storageService.get<number>(ConstantsService.vaultTimeoutKey);
        if (await this.policyService.policyAppliesToUser(PolicyType.MaximumVaultTimeout)) {
            const policy = await this.policyService.getAll(PolicyType.MaximumVaultTimeout);
            // Remove negative values, and ensure it's smaller than maximum allowed value according to policy
            let timeout = Math.min(vaultTimeout, policy[0].data.minutes);

            if (vaultTimeout || timeout < 0) {
                timeout = policy[0].data.minutes;
            }

            // We really shouldn't need to set the value here, but multiple services relies on this value being correct.
            if (vaultTimeout !== timeout) {
                await this.storageService.save(ConstantsService.vaultTimeoutKey, timeout);
            }

            return timeout;
        }
        return vaultTimeout;
    }

    clear(): Promise<any> {
        this.everBeenUnlocked = false;
        this.pinProtectedKey = null;
        return this.storageService.remove(ConstantsService.protectedPin);
    }
}
