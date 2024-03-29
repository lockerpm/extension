import { DeviceType } from '../enums/deviceType';
import { ThemeType } from '../enums/themeType';

export abstract class PlatformUtilsService {
    identityClientId: string;
    getDevice: () => DeviceType;
    getDeviceString: () => string;
    isFirefox: () => boolean;
    isChrome: () => boolean;
    isEdge: () => boolean;
    isOpera: () => boolean;
    isVivaldi: () => boolean;
    isSafari: () => boolean;
    isIE: () => boolean;
    isMacAppStore: () => boolean;
    isViewOpen: () => Promise<boolean>;
    launchUri: (uri: string, options?: any) => void;
    saveFile: (win: any, blobData: any, blobOptions: any, fileName: string) => void;
    getApplicationVersion: () => Promise<string>;
    supportsWebAuthn: (win: any) => boolean;
    supportsDuo: () => boolean;
    showToast: (type: 'error' | 'success' | 'warning' | 'info', title: string, text: string | string[],
        options?: any) => void;
    showDialog: (body: string, title?: string, confirmText?: string, cancelText?: string,
        type?: string, bodyIsHtml?: boolean) => Promise<boolean>;
    isDev: () => boolean;
    isSelfHost: () => boolean;
    copyToClipboard: (text: string, options?: any) => void | boolean;
    readFromClipboard: (options?: any) => Promise<string>;
    supportsBiometric: () => Promise<boolean>;
    authenticateBiometric: () => Promise<boolean>;
    getDefaultSystemTheme: () => Promise<ThemeType.Light | ThemeType.Dark>;
    onDefaultSystemThemeChange: (callback: ((theme: ThemeType.Light | ThemeType.Dark) => unknown)) => unknown;
    getEffectiveTheme: () => Promise<ThemeType>;
    supportsSecureStorage: () => boolean;
}
