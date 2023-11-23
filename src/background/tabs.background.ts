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
      this.main.onReplacedRan = true;
      await this.main.refreshBadgeAndMenu();
      await this.notificationBackground.checkNotificationQueue();
    });

    chrome.tabs.onUpdated.addListener(async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
      if (this.main.onUpdatedRan) {
        return;
      }
      this.main.onUpdatedRan = true;
      await this.main.refreshBadgeAndMenu();
      setTimeout(async () => {
        const tabInfo = await BrowserApi.getTabFromCurrentWindowId();
        if (tabInfo) {
          await this.main.collectPageDetailsForContentScript(tabInfo, 'notificationBar');
          await this.notificationBackground.checkNotificationQueue(tabInfo);
        }
      }, 1000);
    });
  }
}
