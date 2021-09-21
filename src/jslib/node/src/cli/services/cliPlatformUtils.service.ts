import * as child_process from 'child_process';

import { DeviceType } from 'jslib-common/enums/deviceType';

import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';

// tslint:disable-next-line
const open = require('open');

export class CliPlatformUtilsService implements PlatformUtilsService {
    identityClientId: string;

    private deviceCache: DeviceType = null;

    constructor(identityClientId: string, private packageJson: any) {
        this.identityClientId = identityClientId;
    }

    getDevice(): DeviceType {
        if (!this.deviceCache) {
            switch (process.platform) {
                case 'win32':
                    this.deviceCache = DeviceType.WindowsDesktop;
                    break;
                case 'darwin':
                    this.deviceCache = DeviceType.MacOsDesktop;
                    break;
                case 'linux':
                default:
                    this.deviceCache = DeviceType.LinuxDesktop;
                    break;
            }
        }

        return this.deviceCache;
    }

    getDeviceString(): string {
        const device = DeviceType[this.getDevice()].toLowerCase();
        return device.replace('desktop', '');
    }

    isFirefox() {
        return false;
    }

    isChrome() {
        return false;
    }

    isEdge() {
        return false;
    }

    isOpera() {
        return false;
    }

    isVivaldi() {
        return false;
    }

    isSafari() {
        return false;
    }

    isIE() {
        return false;
    }

    isMacAppStore() {
        return false;
    }

    isViewOpen() {
        return Promise.resolve(false);
    }

    launchUri(uri: string, options?: any): void {
        if (process.platform === 'linux') {
            child_process.spawnSync('xdg-open', [uri]);
        } else {
            open(uri);
        }
    }

    saveFile(win: Window, blobData: any, blobOptions: any, fileName: string): void {
        throw new Error('Not implemented.');
    }

    getApplicationVersion(): Promise<string> {
        return Promise.resolve(this.packageJson.version);
    }

    supportsWebAuthn(win: Window) {
        return false;
    }

    supportsDuo(): boolean {
        return false;
    }

    showToast(type: 'error' | 'success' | 'warning' | 'info', title: string, text: string | string[],
        options?: any): void {
        throw new Error('Not implemented.');
    }

    showDialog(text: string, title?: string, confirmText?: string, cancelText?: string, type?: string):
        Promise<boolean> {
        throw new Error('Not implemented.');
    }

    isDev(): boolean {
        return process.env.BWCLI_ENV === 'development';
    }

    isSelfHost(): boolean {
        return false;
    }

    copyToClipboard(text: string, options?: any): void {
        throw new Error('Not implemented.');
    }

    readFromClipboard(options?: any): Promise<string> {
        throw new Error('Not implemented.');
    }

    supportsBiometric(): Promise<boolean> {
        return Promise.resolve(false);
    }

    authenticateBiometric(): Promise<boolean> {
        return Promise.resolve(false);
    }

    getDefaultSystemTheme() {
        return Promise.resolve('light' as 'light' | 'dark');
    }

    onDefaultSystemThemeChange() {
        /* noop */
    }

    supportsSecureStorage(): boolean {
        return false;
    }
}
