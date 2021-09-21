import MainBackground from './main.background';

export default class TabsBackground {
    private tabs: any;

    constructor(private main: MainBackground) {
        this.tabs = chrome.tabs;
    }

    async init() {
        if (!this.tabs) {
            return;
        }

        this.tabs.onActivated.addListener(async (activeInfo: any) => {
            await this.main.refreshBadgeAndMenu();
            this.main.messagingService.send('tabActivated');
            this.main.messagingService.send('tabChanged');
        });

        this.tabs.onReplaced.addListener(async (addedTabId: any, removedTabId: any) => {
            if (this.main.onReplacedRan) {
                return;
            }
            this.main.onReplacedRan = true;
            await this.main.checkNotificationQueue();
            await this.main.refreshBadgeAndMenu();
            this.main.messagingService.send('tabReplaced');
            this.main.messagingService.send('tabChanged');
        });

        this.tabs.onUpdated.addListener(async (tabId: any, changeInfo: any, tab: any) => {
            if (this.main.onUpdatedRan) {
                return;
            }
            this.main.onUpdatedRan = true;
            await this.main.checkNotificationQueue();
            await this.main.refreshBadgeAndMenu();
            this.main.messagingService.send('tabUpdated');
            this.main.messagingService.send('tabChanged');
        });
    }
}
