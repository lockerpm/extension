self.addEventListener('message', event => {
  if (event.source !== self)
    return;
  if (event.data.command && event.data.command === "sso-authResult") {
    chrome.runtime.sendMessage({
      command: event.data.command,
      email: event.data.email,
    });
  }
}, false);

const forwardCommands = [
  'promptForLogin',
  'addToLockedVaultPendingNotifications',
  'unlockCompleted',
  'addToLockedVaultPendingInformMenu'
];

chrome.runtime.onMessage.addListener(event => {
  if (forwardCommands.includes(event.command)) {
    chrome.runtime.sendMessage(event);
  }
});
