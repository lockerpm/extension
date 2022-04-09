import { CipherType } from 'jslib-common/enums/cipherType';

import { CipherView } from 'jslib-common/models/view/cipherView';
import { LoginUriView } from 'jslib-common/models/view/loginUriView';
import { LoginView } from 'jslib-common/models/view/loginView';

import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { FolderService } from 'jslib-common/abstractions/folder.service';
import { PolicyService } from 'jslib-common/abstractions/policy.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { UserService } from 'jslib-common/abstractions/user.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';
import { ConstantsService } from 'jslib-common/services/constants.service';
import { AutofillService } from '../services/abstractions/autofill.service';

import { BrowserApi } from '../browser/browserApi';

import MainBackground from './main.background';

import { Utils } from 'jslib-common/misc/utils';

import { PolicyType } from 'jslib-common/enums/policyType';

import AddChangePasswordQueueMessage from './models/addChangePasswordQueueMessage';
import AddLoginQueueMessage from './models/addLoginQueueMessage';
import AddLoginRuntimeMessage from './models/addLoginRuntimeMessage';
import ChangePasswordRuntimeMessage from './models/changePasswordRuntimeMessage';
import LockedVaultPendingNotificationsItem from './models/lockedVaultPendingNotificationsItem';
import { NotificationQueueMessageType } from './models/notificationQueueMessageType';
import { CipherRequest } from 'jslib-common/models/request/cipherRequest';
import axios from 'axios';
export default class NotificationBackground {

    private notificationQueue: (AddLoginQueueMessage | AddChangePasswordQueueMessage)[] = [];

    constructor(private main: MainBackground, private autofillService: AutofillService,
        private cipherService: CipherService, private storageService: StorageService,
        private vaultTimeoutService: VaultTimeoutService, private policyService: PolicyService,
        private folderService: FolderService,  private userService: UserService) {
    }

    async init() {
        if (chrome.runtime == null) {
            return;
        }

        BrowserApi.messageListener('notification.background', async (msg: any, sender: chrome.runtime.MessageSender) => {
            await this.processMessage(msg, sender);
        });

        this.cleanupNotificationQueue();
    }

    async processMessage(msg: any, sender: chrome.runtime.MessageSender) {
        switch (msg.command) {
          case 'unlockCompleted':
                if (msg.data.target !== 'notification.background') {
                    return;
                }
                await this.processMessage(msg.data.commandToRetry.msg, msg.data.commandToRetry.sender);
                break;
            case 'bgGetDataForTab':
                await this.getDataForTab(sender.tab, msg.responseCommand);
                break;
            case 'bgCloseNotificationBar':
                await BrowserApi.tabSendMessageData(sender.tab, 'closeNotificationBar');
                break;
            case 'bgAdjustNotificationBar':
                await BrowserApi.tabSendMessageData(sender.tab, 'adjustNotificationBar', msg.data);
                break;
            case 'bgAddLogin':
                await this.addLogin(msg.login, sender.tab);
                break;
            case 'bgChangedPassword':
                await this.changedPassword(msg.data, sender.tab);
                break;
            case 'bgAddClose':
            case 'bgChangeClose':
                this.removeTabFromNotificationQueue(sender.tab);
                break;
            case 'bgAddSave':
            case 'bgChangeSave':
                if (await this.vaultTimeoutService.isLocked()) {
                    // console.log('vault locked');
                    const retryMessage: LockedVaultPendingNotificationsItem = {
                        commandToRetry: {
                            msg: msg,
                            sender: sender,
                        },
                        target: 'notification.background',
                    };
                    await BrowserApi.tabSendMessageData(sender.tab, 'addToLockedVaultPendingNotifications', retryMessage);
                    await BrowserApi.tabSendMessageData(sender.tab, 'promptForLogin');
                    return;
                }
                // console.log('vault unlocked')
                await this.saveOrUpdateCredentials(sender.tab, msg.folder);
                break;
            case 'bgNeverSave':
                await this.saveNever(sender.tab);
                break;
            case 'collectPageDetailsResponse':
                switch (msg.sender) {
                    case 'notificationBar':
                        // console.log(msg.details)
                        const forms = this.autofillService.getFormsWithPasswordFields(msg.details);
                        // const testCardForms = this.autofillService.getCardForms(msg.details);
                        // console.log('login forms: ', forms)
                        // console.log('card forms: ', testCardForms)
                        await BrowserApi.tabSendMessageData(msg.tab, 'notificationBarPageDetails', {
                            details: msg.details,
                            forms: forms,
                        });
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    }

    async checkNotificationQueue(tab: chrome.tabs.Tab = null): Promise<void> {
        if (this.notificationQueue.length === 0) {
            return;
        }

        if (tab != null) {
            this.doNotificationQueueCheck(tab);
            return;
        }

        const currentTab = await BrowserApi.getTabFromCurrentWindow();
        if (currentTab != null) {
            this.doNotificationQueueCheck(currentTab);
        }
    }

    private cleanupNotificationQueue() {
        for (let i = this.notificationQueue.length - 1; i >= 0; i--) {
            if (this.notificationQueue[i].expires < new Date()) {
                this.notificationQueue.splice(i, 1);
            }
        }
        setTimeout(() => this.cleanupNotificationQueue(), 2 * 60 * 1000); // check every 2 minutes
    }

    private doNotificationQueueCheck(tab: chrome.tabs.Tab): void {
        if (tab == null) {
            return;
        }

        const tabDomain = Utils.getDomain(tab.url);
        if (tabDomain == null) {
            return;
        }

        for (let i = 0; i < this.notificationQueue.length; i++) {
            if (this.notificationQueue[i].tabId !== tab.id || this.notificationQueue[i].domain !== tabDomain) {
                continue;
            }

            if (this.notificationQueue[i].type === NotificationQueueMessageType.addLogin) {
                BrowserApi.tabSendMessageData(tab, 'openNotificationBar', {
                    type: 'add',
                    typeData: {
                        isVaultLocked: this.notificationQueue[i].wasVaultLocked,
                    },
                });
            } else if (this.notificationQueue[i].type === NotificationQueueMessageType.changePassword) {
                BrowserApi.tabSendMessageData(tab, 'openNotificationBar', {
                    type: 'change',
                    typeData: {
                        isVaultLocked: this.notificationQueue[i].wasVaultLocked,
                    },
                });
            }
            break;
        }
    }

    private removeTabFromNotificationQueue(tab: chrome.tabs.Tab) {
        for (let i = this.notificationQueue.length - 1; i >= 0; i--) {
            if (this.notificationQueue[i].tabId === tab.id) {
                this.notificationQueue.splice(i, 1);
            }
        }
    }

  private async addLogin(loginInfo: AddLoginRuntimeMessage, tab: chrome.tabs.Tab) {
      if (!await this.userService.isAuthenticated()) {
            // console.log('unauthenticated')
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
            this.pushAddLoginToQueue(loginDomain, loginInfo, tab, true);
            return;
        }

        const ciphers = await this.cipherService.getAllDecryptedForUrl(loginInfo.url);
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

        } else if (usernameMatches.length === 1 && usernameMatches[0].login.password !== loginInfo.password) {
            const disabledChangePassword = await this.storageService.get<boolean>(
                ConstantsService.disableChangedPasswordNotificationKey);
            if (disabledChangePassword) {
                return;
            }
            this.pushChangePasswordToQueue(usernameMatches[0].id, loginDomain, loginInfo.password, tab);
        }
    }

    private async pushAddLoginToQueue(loginDomain: string, loginInfo: AddLoginRuntimeMessage, tab: chrome.tabs.Tab, isVaultLocked: boolean = false) {
        // remove any old messages for this tab
        this.removeTabFromNotificationQueue(tab);
        const message: AddLoginQueueMessage = {
            type: NotificationQueueMessageType.addLogin,
            username: loginInfo.username,
            password: loginInfo.password,
            domain: loginDomain,
            uri: loginInfo.url,
            tabId: tab.id,
            expires: new Date((new Date()).getTime() + 5 * 60000), // 5 minutes
            wasVaultLocked: isVaultLocked,
        };
        this.notificationQueue.push(message);
        await this.checkNotificationQueue(tab);
    }

    private async changedPassword(changeData: ChangePasswordRuntimeMessage, tab: chrome.tabs.Tab) {
        const loginDomain = Utils.getDomain(changeData.url);
        if (loginDomain == null) {
            return;
        }

        if (await this.vaultTimeoutService.isLocked()) {
            this.pushChangePasswordToQueue(null, loginDomain, changeData.newPassword, tab, true);
            return;
        }

        let id: string = null;
        const ciphers = await this.cipherService.getAllDecryptedForUrl(changeData.url);
        if (changeData.currentPassword != null) {
            const passwordMatches = ciphers.filter(c => c.login.password === changeData.currentPassword);
            if (passwordMatches.length === 1) {
                id = passwordMatches[0].id;
            }
        } else if (ciphers.length === 1) {
            id = ciphers[0].id;
        }
        if (id != null) {
            this.pushChangePasswordToQueue(id, loginDomain, changeData.newPassword, tab);
        }
    }

    private async pushChangePasswordToQueue(cipherId: string, loginDomain: string, newPassword: string, tab: chrome.tabs.Tab, isVaultLocked: boolean = false) {
        // remove any old messages for this tab
        this.removeTabFromNotificationQueue(tab);
        const message: AddChangePasswordQueueMessage = {
            type: NotificationQueueMessageType.changePassword,
            cipherId: cipherId,
            newPassword: newPassword,
            domain: loginDomain,
            tabId: tab.id,
            expires: new Date((new Date()).getTime() + 5 * 60000), // 5 minutes
            wasVaultLocked: isVaultLocked,
        };
        this.notificationQueue.push(message);
        await this.checkNotificationQueue(tab);
    }

    private async saveOrUpdateCredentials(tab: chrome.tabs.Tab, folderId?: string) {
        // console.log('saveOrUpdateCredentials')
        for (let i = this.notificationQueue.length - 1; i >= 0; i--) {
            const queueMessage = this.notificationQueue[i];
            if (queueMessage.tabId !== tab.id ||
                (queueMessage.type !== NotificationQueueMessageType.addLogin && queueMessage.type !== NotificationQueueMessageType.changePassword)) {
                continue;
            }

            const tabDomain = Utils.getDomain(tab.url);
            if (tabDomain != null && tabDomain !== queueMessage.domain) {
                continue;
            }

            this.notificationQueue.splice(i, 1);
            BrowserApi.tabSendMessageData(tab, 'closeNotificationBar');

            if (queueMessage.type === NotificationQueueMessageType.changePassword) {
                const message = (queueMessage as AddChangePasswordQueueMessage);
                const cipher = await this.getDecryptedCipherById(message.cipherId);
                if (cipher == null) {
                    return;
                }
                await this.updateCipher(cipher, message.newPassword);
                return;
            }

            if (!queueMessage.wasVaultLocked) {
                await this.createNewCipher(queueMessage as AddLoginQueueMessage, folderId);
            }

            // If the vault was locked, check if a cipher needs updating instead of creating a new one
            if (queueMessage.type === NotificationQueueMessageType.addLogin && queueMessage.wasVaultLocked === true) {
                const message = (queueMessage as AddLoginQueueMessage);
                const ciphers = await this.cipherService.getAllDecryptedForUrl(message.uri);
                const usernameMatches = ciphers.filter(c => c.login.username != null &&
                    c.login.username.toLowerCase() === message.username);

                if (usernameMatches.length >= 1) {
                    await this.updateCipher(usernameMatches[0], message.password);
                    return;
                }

                await this.createNewCipher(message, folderId);
            }
        }
    }

    private async createNewCipher(queueMessage: AddLoginQueueMessage, folderId: string) {
        const loginModel = new LoginView();
        const loginUri = new LoginUriView();
        loginUri.uri = queueMessage.uri;
        loginModel.uris = [loginUri];
        loginModel.username = queueMessage.username;
        loginModel.password = queueMessage.password;
        const model = new CipherView();
        model.name = Utils.getHostname(queueMessage.uri) || queueMessage.domain;
        model.name = model.name.replace(/^www\./, '');
        model.type = CipherType.Login;
        model.login = loginModel;

        if (!Utils.isNullOrWhitespace(folderId)) {
            const folders = await this.folderService.getAllDecrypted();
            if (folders.some(x => x.id === folderId)) {
                model.folderId = folderId;
            }
        }

        const cipher = await this.cipherService.encrypt(model);
        // console.log("notificationBar createNewCipher");
        // await this.cipherService.saveWithServer(cipher);
        const csToken = await this.main.storageService.get<string>("cs_token");
        const headers = {
          "Authorization": "Bearer " + csToken,
          "Content-Type": "application/json; charset=utf-8"
        };
        const data = new CipherRequest(cipher)
        await axios.post(`${process.env.VUE_APP_BASE_API_URL}/cystack_platform/pm/ciphers/vaults`, data, {headers: headers})
    }

    private async getDecryptedCipherById(cipherId: string) {
        const cipher = await this.cipherService.get(cipherId);
        if (cipher != null && cipher.type === CipherType.Login) {
            return await cipher.decrypt();
        }
        return null;
    }

    private async updateCipher(cipher: CipherView, newPassword: string) {
        if (cipher != null && cipher.type === CipherType.Login) {
            cipher.login.password = newPassword;
            const newCipher = await this.cipherService.encrypt(cipher);
            // await this.cipherService.saveWithServer(newCipher);
            // console.log('notificationBar updateCipher')
            const csToken = await this.main.storageService.get<string>("cs_token");
            const headers = {
              "Authorization": "Bearer " + csToken,
              "Content-Type": "application/json; charset=utf-8"
            };
            const data = new CipherRequest(newCipher)
            await axios.put(`${process.env.VUE_APP_BASE_API_URL}/cystack_platform/pm/ciphers/${cipher.id}`, data, {headers: headers})
        }
    }

    private async saveNever(tab: chrome.tabs.Tab) {
        for (let i = this.notificationQueue.length - 1; i >= 0; i--) {
            const queueMessage = this.notificationQueue[i];
            if (queueMessage.tabId !== tab.id || queueMessage.type !== NotificationQueueMessageType.addLogin) {
                continue;
            }

            const tabDomain = Utils.getDomain(tab.url);
            if (tabDomain != null && tabDomain !== queueMessage.domain) {
                continue;
            }

            this.notificationQueue.splice(i, 1);
            BrowserApi.tabSendMessageData(tab, 'closeNotificationBar');

            const hostname = Utils.getHostname(tab.url);
            await this.cipherService.saveNeverDomain(hostname);
        }
    }

    private async getDataForTab(tab: chrome.tabs.Tab, responseCommand: string) {
        const responseData: any = {};
        if (responseCommand === 'notificationBarGetFoldersList') {
            responseData.folders = await this.folderService.getAllDecrypted();
        }

        await BrowserApi.tabSendMessageData(tab, responseCommand, responseData);
    }

    private async allowPersonalOwnership(): Promise<boolean> {
        return !await this.policyService.policyAppliesToUser(PolicyType.PersonalOwnership);
    }
}
