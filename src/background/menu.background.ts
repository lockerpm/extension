import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { BrowserApi } from '@/browser/browserApi';
import RequestBackground from './request.background';
import { CipherType } from 'jslib-common/enums/cipherType';

const menuPortName = 'locker-menu-port'

export default class MenuBackground {
  private readonly openPopout = () => {};
  private menuPort: chrome.runtime.Port;
  private initData: any;
  constructor(
    private storageService: StorageService,
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
      this.initData = message.data;
      this.getPrivateEmails();
    } else if (message.command === 'resizeInformMenu') {
      this.resizeInformMenu(message)
    } else if (message.command === 'useCipher') {
      this.useCipher(message)
    } else if (message.command === 'getPrivateEmails') {
      this.getPrivateEmails();
    } else if (message.command === 'createPrivateEmail') {
      this.createPrivateEmail(message.data.isFill);
    } 
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

  private useCipher = async (message: any) => {
    const { cipherId, payload } = message.data;
    await this.requestService.use_cipher(cipherId, payload);
  }

  private getPrivateEmails = async () => {
    const res = await this.requestService.get_addresses();
    if (res.results) {
      this.storageService.save('privateEmails', JSON.stringify(res.results || []))
    } else {
      this.storageService.save('privateEmails', JSON.stringify([]))
    }
  }

  private createPrivateEmail = async (isFill = false) => {
    const res = await this.requestService.create_address();
    if (res && res.full_address) {
      if (isFill) {
        const tab = await BrowserApi.getTabFromCurrentWindow();
        if (!tab) {
          return;
        }
        BrowserApi.tabSendMessage(tab, {
          command: 'collectPageDetails',
          tab: tab,
          sender: 'autofillItem',
          cipher: { type: CipherType.Login, login: { username: res.full_address } },
        });
      }
      this.getPrivateEmails();
    } else {
      this.notificationAlert('create_private_email_error')
    }
  }

  private async notificationAlert(type: string) {
    const tab = await BrowserApi.getTabFromCurrentWindow();
    if (!tab) {
      return;
    }
    BrowserApi.tabSendMessage(tab, {
      command: 'alert',
      tab: tab,
      type: type,
    });
  }
}
