/* eslint-disable @typescript-eslint/no-empty-function */
import MainBackground from './background/main.background';
const lockerMain = (self as any ).lockerMain = new MainBackground();

async function createOffscreen() {
  await lockerMain.bootstrap().then(() => {});
  await chrome['offscreen']?.createDocument({
    url: 'offscreen.html',
    reasons: [
      'TESTING',
      'AUDIO_PLAYBACK',
      'BLOBS',
      'IFRAME_SCRIPTING',
      'DOM_SCRAPING',
      'DOM_PARSER',
      'WEB_RTC',
      'CLIPBOARD',
      'LOCAL_STORAGE',
      'WORKERS',
      'USER_MEDIA',
      'DISPLAY_MEDIA',
      'GEOLOCATION',
    ],
    justification: 'keep service worker running',
  }).catch(() => {
    //
  });
}

chrome.runtime.onStartup.addListener(createOffscreen);
createOffscreen();