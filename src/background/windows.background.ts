import MainBackground from './main.background';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';

export default class WindowsBackground {
  constructor(private main: MainBackground, private vaultTimeout: VaultTimeoutService) {}
  async init() {
    chrome?.windows?.onCreated?.addListener(async () => {
      const vaultTimeout = await this.vaultTimeout.getVaultTimeout();
      if (!vaultTimeout || vaultTimeout < 0) {
        await this.vaultTimeout.lock();
      }
    });
    
    chrome?.windows?.onFocusChanged?.addListener(async (windowId: any) => {
      if (windowId === null || windowId < 0) {
        return;
      }
      await this.main.refreshBadgeAndMenu();
    });
  }
}
