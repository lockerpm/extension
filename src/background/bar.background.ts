import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { BrowserApi } from '@/browser/browserApi';
import RequestBackground from './request.background';

const barPortName = 'locker-bar-port'

export default class BarBackground {
  private barPort: chrome.runtime.Port;
  private initData: any;
  constructor(
    private cipherService: CipherService,
    private requestService: RequestBackground
  ) {}
  async init() {
    this.setupExtensionMessageListeners();
  }

  private setupExtensionMessageListeners() {
    BrowserApi.messageListener("bar.background", this.handleExtensionMessage);
    chrome.runtime.onMessageExternal.addListener(this.handleExtensionMessage);
    BrowserApi.addListener(chrome.runtime.onConnect, this.handlePortOnConnect);
  }

  private handleExtensionMessage = (
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ) => {
    if (message.command === 'initAutoSaveBar') {
      this.initData = message.data
    };
    sendResponse();
    return true;
  };

  private handlePortOnConnect = async (port: chrome.runtime.Port) => {
    const isBarPort = port.name === barPortName;
    if (!isBarPort) {
      return;
    }

    if (isBarPort) {
      this.barPort = port;
    }

    port.onMessage.addListener(this.handleOverlayElementPortMessage);
    port.postMessage({
      command: 'initAutoSaveBar',
      isConnected: isBarPort,
      initData: this.initData
    });
  };

  private handleOverlayElementPortMessage = (
    message: any,
    port: chrome.runtime.Port,
  ) => {
    const command = message?.command;
    if (port.name === barPortName) {
      // check event
    }
  };
}
