import MainBackground from './main.background';
import NotificationBackground from './notification.background';
import { BrowserApi } from "@/browser/browserApi";

export default class TabsBackground {
  constructor(private main: MainBackground, private notificationBackground: NotificationBackground) {
  }

  async init() {
    if (!chrome.tabs) {
      return;
    }

    chrome.tabs.onActivated.addListener(async (activeInfo: chrome.tabs.TabActiveInfo) => {
      await this.main.refreshBadgeAndMenu();
      const tab = await BrowserApi.getTabFromCurrentWindowId();
      if (tab) {
        await this.main.collectPageDetailsForContentScript(tab, 'notificationBar');
      }
    });

    chrome.tabs.onReplaced.addListener(async (addedTabId: number, removedTabId: number) => {
      if (this.main.onReplacedRan) {
        return;
      }
      await this.main.refreshBadgeAndMenu();
      await this.notificationBackground.checkNotificationQueue();
      this.main.onReplacedRan = true;
    });

    chrome.tabs.onUpdated.addListener(async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
      if (this.main.onUpdatedRan) {
        return;
      }
      if (tab) {
        const tabInfo = await BrowserApi.getTabFromCurrentWindowId();
        await this.main.collectPageDetailsForContentScript(tabInfo, 'notificationBar');
      }
      this.main.onUpdatedRan = true;
    });
  }
}
