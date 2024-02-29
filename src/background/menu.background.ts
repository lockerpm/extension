import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { CipherView } from 'jslib-common/models/view/cipherView';
import { BrowserApi } from '@/browser/browserApi';
import RequestBackground from './request.background';

const menuPortName = 'locker-menu-port'

export default class MenuBackground {
  private readonly openUnlockPopout = () => {};
  private readonly openViewVaultItemPopout = () => {};
  private readonly openAddEditVaultItemPopout = () => {};
  private menuPort: chrome.runtime.Port;
  private initData: any;
  constructor(
    private cipherService: CipherService,
    private requestService: RequestBackground
  ) {}
  async init() {
    this.setupExtensionMessageListeners();
  }

  private setupExtensionMessageListeners() {
    BrowserApi.messageListener("menu.background", this.handleExtensionMessage);
    chrome.runtime.onMessageExternal.addListener(this.handleExtensionMessage);
    BrowserApi.addListener(chrome.runtime.onConnect, this.handlePortOnConnect);
  }

  private handleExtensionMessage = (
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ) => {
    if (message.command === 'initInformMenu') {
      this.initData = message.data
    } else if (message.command === 'resizeInformMenu') {
      this.resizeInformMenu(message)
    } else if (message.command === 'addExcludeDomain') {
      this.addExcludeDomain(message)
    } else if (message.command === 'removeExcludeDomain') {
      this.removeExcludeDomain(message)
    } else if (message.command === 'useCipher') {
      this.useCipher(message)
    } else if (message.command === 'updateCipher') {
      this.updateCipher(message)
    };
    sendResponse();
    return true;
  };

  private handlePortOnConnect = async (port: chrome.runtime.Port) => {
    const isMenuPort = port.name === menuPortName;
    if (!isMenuPort) {
      return;
    }

    if (isMenuPort) {
      this.menuPort = port;
    }

    port.onMessage.addListener(this.handleOverlayElementPortMessage);
    port.postMessage({
      command: 'initAutofillMenuList',
      isConnected: isMenuPort,
      initData: this.initData
    });
  };

  private handleOverlayElementPortMessage = (
    message: any,
    port: chrome.runtime.Port,
  ) => {
    const command = message?.command;
    if (port.name === menuPortName) {
      // check event
    }
  };

  private resizeInformMenu = (message: any) => {
    this.menuPort.postMessage({
      command: 'updateIframePosition',
      styles: message.data.styles
    });
  }

  private getExcludeDomains = async () => {
    const { results } = await this.requestService.exclude_domains();
    await this.cipherService.saveNeverDomains(results)
  }

  private addExcludeDomain = async (message: any) => {
    const payload = message.data;
    await this.requestService.add_exclude_domain(payload);
    await this.getExcludeDomains()
    await this.notificationAlert('added_exclude_domain');
  }

  private removeExcludeDomain = async (message: any) => {
    const { excludeId } = message.data;
    await this.requestService.delete_exclude_domain(excludeId);
    await this.getExcludeDomains()
    await this.notificationAlert('removed_exclude_domain');
  }

  private useCipher = async (message: any) => {
    const { cipherId, payload } = message.data;
    await this.requestService.use_cipher(cipherId, payload);
  }

  private updateCipher = async (message: any) => {
    const { cipherId, payload } = message.data;
    await this.requestService.update_cipher(cipherId, payload);
    await this.notificationAlert('updated_cipher');
  }

  private async notificationAlert(type: string) {
    const tab = await BrowserApi.getTabFromCurrentWindow();
    BrowserApi.tabSendMessage(tab, {
      command: 'alert',
      tab: tab,
      type: type,
    });
  }
}
