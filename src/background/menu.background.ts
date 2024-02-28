import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { CipherView } from 'jslib-common/models/view/cipherView';
import { BrowserApi } from '@/browser/browserApi';

const menuPortName = 'locker-menu-port'

export default class MenuBackground {
  private readonly openUnlockPopout = () => {};
  private readonly openViewVaultItemPopout = () => {};
  private readonly openAddEditVaultItemPopout = () => {};
  private menuPort: chrome.runtime.Port;
  private initData: any;
  constructor(
    private cipherService: CipherService,
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
    // Check message
    if (message.command === 'initInformMenu') {
      this.initData = message.data
    }
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
}
