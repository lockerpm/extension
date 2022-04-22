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
        showGeneratedPassword(msg.data)
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
      if (ciphers == null) {
        listContainer.innerHTML = '<div class="cs-inform-no-ciphers">Vault is locked.</div>'
        return
      }
      if (!ciphers.length) {
        listContainer.innerHTML = '<div class="cs-inform-no-ciphers">No passwords found for this site.</div>'
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
    // console.log(window.parent)
    const passwordGenerationContainer = 
    `<div class="cs-generate-password">
      <div class="cs-generate-password-output">
        <div class="cs-password-output">
          <div id="generated_password" class="cs-generate-password-password"></div>
          <div id="button_regenerate" style="cursor: pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.5187 9.34668H21.0187V4.84668" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6.16882 6.16885C6.93419 5.40236 7.84316 4.79429 8.84375 4.37941C9.84433 3.96453 10.9169 3.75098 12.0001 3.75098C13.0833 3.75098 14.1558 3.96453 15.1564 4.37941C16.157 4.79429 17.066 5.40236 17.8313 6.16885L21.0188 9.34698" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7.48132 14.6533H2.98132V19.1533" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17.8313 17.8314C17.066 18.5979 16.157 19.206 15.1564 19.6209C14.1558 20.0358 13.0833 20.2493 12.0001 20.2493C10.9169 20.2493 9.84433 20.0358 8.84375 19.6209C7.84316 19.206 6.93419 18.5979 6.16882 17.8314L2.98132 14.6533" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <div id="password_strength" class="cs-password-strength">
          <svg
            class="mr-2"
            width="16px"
            height="16px"
            viewBox="0 0 16 16"
            version="1.1"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="icon-check" fill="currentColor">
              <path d="M6.65625 10.9453L4 8.25781L4.9375 7.32031L6.65625 9.03906L11.0625 4.66406L12 5.60156L6.65625 10.9453ZM8 0.257813L2 2.94531L2 6.94531Q2 8.75781 2.78125 10.4453Q3.5625 12.1328 4.9375 13.3203Q6.3125 14.5078 8 14.9453Q9.6875 14.5078 11.0625 13.3203Q12.4375 12.1328 13.2188 10.4453Q14 8.75781 14 6.94531L14 2.94531L8 0.257813Z" />
            </g>
          </svg>
          <div id="password_strength_text" class="cs-text-strength">
          </div>
        </div>
        <div>
          <button id="button_use_password">
            Use this password
          </button>
        </div>
      </div>
      <div class="cs-generate-password-options">
        <div class="cs-ui-components">
          <div>Length: <span id="password_length"></span></div>
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
    document.getElementById('button_use_password').onclick = useGeneratedPassword
    document.getElementById('button_regenerate').onclick = bgGeneratePassword
    for (let i = 0; i < checkboxArray.length; i++){
      const checkboxEl = document.getElementById(checkboxArray[i])
      if (checkboxEl) {
        checkboxEl.onchange = bgGeneratePassword
      }
    }
    bgGeneratePassword()
  }
  function showGeneratedPassword (passwordData) {
    let color = '#000000'
    let textStrength = ''
    switch (passwordData.passwordStrength.score) {
    case 4:
      color = '#3DB249'
      textStrength = 'Strong'
      break;
    case 3:
      color = '#0363C2'
      textStrength = 'Good'
      break;
    case 2:
      color = '#FF9800'
      textStrength = 'Medium'
      break;
    case 1:
    case 0:
      color = '#F54F64'
      textStrength = 'Weak'
      break;
    default:
      break;
      
    }
    document.getElementById('password_strength').style.color = color
    document.getElementById('password_strength_text').innerHTML = textStrength
    document.getElementById('password_length').innerHTML = passwordData.password.length
    document.getElementById('generated_password').innerHTML = passwordData.password
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
  function useGeneratedPassword () {
    const password = document.getElementById('generated_password').textContent
    sendPlatformMessage({
      command: 'informMenuUsePassword',
      password: password
    })
  }
})
