require('./menu.scss')
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(load, 50);

  function load () {
    const responseCiphersCommand = 'informMenuGetCiphersList';
    const responseGeneratePassword = 'informMenuGetGeneratedPassword'
    const btnDropdown = document.getElementById('dropdownOptions')
    btnDropdown.onclick = function () {
      changeMenuContent()
    }
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.command === responseCiphersCommand && msg.data) {
        fillMenuWithCiphers(msg.data.ciphers);
      }
      if (msg.command === responseGeneratePassword && msg.data) {
        showGeneratedPassword(msg.data.password)
      }
    });
    sendPlatformMessage({
      command: 'bgGetDataForTab',
      responseCommand: responseCiphersCommand
    });
  }
  function sendPlatformMessage (msg) {
    chrome.runtime.sendMessage(msg);
  }
  function fillMenuWithCiphers (ciphers) {
    const listContainer = document.getElementsByClassName('cs-list-withScroll')[0];
    if (listContainer != null) {
      if (!ciphers.length) {
        listContainer.innerHTML = 'No passwords found for this site.'
        return
      }
      for (let i = 0; i < ciphers.length; i++) {
        const cipherRow = document.createElement("div");
        cipherRow.textContent = ciphers[i].login.username
        cipherRow.setAttribute('id', ciphers[i].id)
        cipherRow.classList.add('selection-item')
        listContainer.appendChild(cipherRow)
        cipherRow.onclick = function () {
          sendPlatformMessage({ command: 'informMenuFillCipher', id: cipherRow.id })
        }
      }
    }
  }
  function changeMenuContent () {
    const listContainer = document.getElementsByClassName('cs-list-withScroll')[0];
    if (listContainer) {
      const optionsContainer = '<div class="dropdown-options-list"><div id="OPTION_GENPASS" class="dropdown-option">Generate Password</div></div>'
      listContainer.parentElement.innerHTML = optionsContainer
      document.getElementById('OPTION_GENPASS').onclick = getPasswordGeneration
    }
    else {
      const mainContainer = document.getElementsByTagName('main')[0]
      mainContainer.innerHTML = '<div class="cs-list-withScroll"></div>'
      sendPlatformMessage({
        command: 'bgGetDataForTab',
        responseCommand: 'informMenuGetCiphersList'
      });
    }
  }
  function getPasswordGeneration () {
    const passwordGenerationContainer = 
    `<div>
      <div id="generated-password">
      </div>
    </div>`
    const mainContainer = document.getElementsByTagName('main')[0]
    mainContainer.innerHTML = passwordGenerationContainer
    sendPlatformMessage({
      command: 'bgGeneratePassword',
      responseCommand: 'informMenuGetGeneratedPassword',
      options: {}
    });
  }
  function showGeneratedPassword (password) {
    document.getElementById('generated-password').textContent = password
  }
})
