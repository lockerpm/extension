document.addEventListener('DOMContentLoaded', event => {
    let pageHref: string = null;
    let filledThisHref = false;
    let delayFillTimeout: number;

    const enabledKey = 'enableAutoFillOnPageLoad';
    chrome.storage.local.get(enabledKey, (obj: any) => {
        if (obj != null && obj[enabledKey] === true) {
            setInterval(() => doFillIfNeeded(), 500);
        }
    });
    chrome.runtime.onMessage.addListener((msg: any, sender: any, sendResponse: Function) => {
        if (msg.command === 'fillForm' && pageHref === msg.url) {
            filledThisHref = true;
        }
    });

    function doFillIfNeeded(force: boolean = false) {
        if (force || pageHref !== window.location.href) {
            if (!force) {
                // Some websites are slow and rendering all page content. Try to fill again later
                // if we haven't already.
                filledThisHref = false;
                if (delayFillTimeout != null) {
                    window.clearTimeout(delayFillTimeout);
                }
                delayFillTimeout = window.setTimeout(() => {
                    if (!filledThisHref) {
                        doFillIfNeeded(true);
                    }
                }, 1500);
            }

            pageHref = window.location.href;
            const msg: any = {
                command: 'bgCollectPageDetails',
                sender: 'autofiller',
            };

            chrome.runtime.sendMessage(msg);
        }
    }
});
