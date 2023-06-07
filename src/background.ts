import MainBackground from './background/main.background';

// eslint-disable-next-line no-var
const bitwardenMain = (self as any).bitwardenMain = new MainBackground();
bitwardenMain.bootstrap().then(() => {
  // Finished bootstrapping
});

async function createOffscreen() {
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['BLOBS'],
    justification: 'keep service worker running',
  }).catch(() => {
    //
  });
}
chrome.runtime.onStartup.addListener(createOffscreen);
self.onmessage = (e) => {
  console.log(e);
}
createOffscreen();
