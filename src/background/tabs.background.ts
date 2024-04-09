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
      
      this.main.onReplacedRan = true;
    });

    chrome.tabs.onUpdated.addListener(async (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
      if (changeInfo?.status !== 'complete' || !tab) {
        return;
      }
      await this.main.refreshBadgeAndMenu();
      await this.notificationBackground.checkNotificationQueue();
      await this.main.collectPageDetailsForContentScript(tab, 'notificationBar');
    });
  }
}
