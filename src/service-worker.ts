/* eslint-disable @typescript-eslint/no-empty-function */
import MainBackground from './background/main.background';
const lockerMain = (self as any ).lockerMain = new MainBackground();
lockerMain.bootstrap().then(() => {});

async function createOffscreen() {
  await chrome['offscreen']?.createDocument({
    url: 'offscreen.html',
    reasons: [
      'BLOBS',
      'IFRAME_SCRIPTING',
      'DOM_SCRAPING',
      'DOM_PARSER',
      'WEB_RTC',
      'CLIPBOARD',
      'LOCAL_STORAGE',
      'WORKERS'
    ],
    justification: 'keep service worker running',
  }).catch(() => {
    //
  });
}
chrome.runtime.onStartup.addListener(createOffscreen);
createOffscreen();
