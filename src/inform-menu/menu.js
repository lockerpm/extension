require('./menu.scss')
document.addEventListener('DOMContentLoaded', () => { 
  setTimeout(load, 50);

  function load () {
    const responseFoldersCommand = 'informMenuGetCiphersList';
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.command === responseFoldersCommand && msg.data) {
        fillCiphers(msg.data.ciphers);
      }
    });
    sendPlatformMessage({
      command: 'bgGetDataForTab',
      responseCommand: responseFoldersCommand
    });
  }
  function sendPlatformMessage (msg) {
    chrome.runtime.sendMessage(msg);
  }
  function fillCiphers (ciphers) {
    const listContainer = document.getElementsByClassName('cs-list-withScroll')[0];
    if (listContainer != null) {
      const cipherRow = document.createElement("div");
      cipherRow.textContent = ciphers[0].login.username
      cipherRow.setAttribute('id', ciphers[0].id)
      listContainer.appendChild(cipherRow)
      cipherRow.addEventListener('click', sendPlatformMessage({command: 'informMenuFillCipher', id: cipherRow.id}))
    }
  }
})
