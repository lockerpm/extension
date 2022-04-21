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
      document.getElementById('header-title').innerHTML = 'Saved Login'
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
    `<div class="cs-generate-password">
      <div class="cs-generate-password-password">
      </div>
      <div>
        <button onclick="useGeneratedPassword">
          Use this password
        </button>
      </div>
      <div class="cs-generate-password-options">
        <div class="cs-ui-components">
          <input id="password_length_slider" max="64" min="8" step="1" type="range" value="16">
        </div>
        <hr>
        <label class="cs-generator-checkbox ui-components">
          <input type="checkbox" id="checkbox_use_upper" class="ui-components" checked>
          <span>Use uppercase letters (A-Z)</span>
        </label>
        <label class="cs-generator-checkbox ui-components">
          <input type="checkbox" id="checkbox_use_lower" class="ui-components" checked>
          <span>Use lowercase letters (A-Z)</span>
        </label>
        <label class="cs-generator-checkbox ui-components">
          <input type="checkbox" id="checkbox_use_digits" class="ui-components" checked>
          <span>Use digits (0-9)</span>
        </label>
        <label class="cs-generator-checkbox ui-components">
          <input type="checkbox" id="checkbox_use_symbols" class="ui-components" checked>
          <span>Use symbols (@!$%*)</span>
        </label>
        <label class="cs-generator-checkbox ui-components">
          <input type="checkbox" id="checkbox_avoid_ambiguous" class="ui-components">
          <span>Avoid ambiguous characters</span>
        </label>
      </div>
    </div>`
    const mainContainer = document.getElementsByTagName('main')[0]
    mainContainer.innerHTML = passwordGenerationContainer
    document.getElementById('header-title').innerHTML = 'Password Generator'
    const passwordSlider = document.getElementById('password_length_slider')
    const checkboxArray = ['password_length_slider', 'checkbox_use_upper', 'checkbox_use_lower', 'checkbox_use_digits', 'checkbox_use_symbols', 'checkbox_avoid_ambiguous']
    if (passwordSlider) {
      passwordSlider.oninput = () => {
        document.getElementById('')
      }
    }
    for (let i = 0; i < checkboxArray.length; i++){
      const checkboxEl = document.getElementById(checkboxArray[i])
      if (checkboxEl) {
        checkboxEl.onchange = bgGeneratePassword
      }
    }
    bgGeneratePassword()
  }
  function showGeneratedPassword (password) {
    document.getElementsByClassName('cs-generate-password-password')[0].textContent = password
  }
  function bgGeneratePassword () {
    const generateOptions = getGeneratePasswordOptions()
    sendPlatformMessage({
      command: 'bgGeneratePassword',
      responseCommand: 'informMenuGetGeneratedPassword',
      options: generateOptions
    });
  }
  function getGeneratePasswordOptions () {
    const lengthEl = document.getElementById('password_length_slider')
    const uppercaseEl = document.getElementById('checkbox_use_upper')
    const lowercaseEl = document.getElementById('checkbox_use_lower')
    const numberEl = document.getElementById('checkbox_use_digits')
    const specialEl = document.getElementById('checkbox_use_symbols')
    const ambiguousEl = document.getElementById('checkbox_avoid_ambiguous')
    if (!uppercaseEl.checked && !lowercaseEl.checked && !numberEl.checked && !specialEl.checked) {
      lowercaseEl.checked = true
    }
    return {
      length: parseInt(lengthEl.value),
      uppercase: uppercaseEl.checked,
      lowercase: lowercaseEl.checked,
      number: numberEl.checked,
      special: specialEl.checked,
      ambiguous: ambiguousEl.checked
    }
  }
})
