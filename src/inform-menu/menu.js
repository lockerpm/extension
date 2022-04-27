require('./menu.scss')
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(load, 50);

  function load () {
    const responseCiphersCommand = 'informMenuGetCiphersForCurrentTab';
    const responseSomethingElse = 'informMenuGetCiphers'
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
      if (msg.command === responseSomethingElse && msg.data) {
        fillMenuWithCiphers(msg.data.ciphers)
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
        cipherRow.textContent = getSubTitle(ciphers[i])
        cipherRow.setAttribute('id', ciphers[i].id)
        cipherRow.classList.add('selection-item')
        listContainer.appendChild(cipherRow)
        cipherRow.onclick = function () {
          sendPlatformMessage({ command: 'informMenuFillCipher', id: cipherRow.id })
        }
      }
    }
    function getSubTitle (cipher) {
      let subTitle = ''
      if (cipher.type === 1) {
        subTitle = cipher.login.username
      }
      else if (cipher.type === 3) {
        if (cipher.card._subTitle == null) {
          let _subTitle = this.brand;
          if (cipher.card.number != null && cipher.card.number.length >= 4) {
            if (cipher.card._subTitle != null && cipher.card._subTitle !== '') {
              _subTitle += ', ';
            } else {
              _subTitle = '';
            }

            // Show last 5 on amex, last 4 for all others
            const count = cipher.card.number.length >= 5 && cipher.card.number.match(new RegExp('^3[47]')) != null ? 5 : 4;
            _subTitle += ('*' + cipher.card.number.substr(cipher.card.number.length - count));
          }
          subTitle = _subTitle
        }
        subTitle = cipher.card._subTitle
      }
      else if (cipher.type === 4) {
        let _subTitle = ''
        if (cipher.identity._subTitle == null && (cipher.identity.firstName != null || cipher.identity.lastName != null)) {
          _subTitle = '';
          if (cipher.identity.firstName != null) {
            _subTitle = cipher.identity.firstName;
          }
          if (cipher.identity.lastName != null) {
            if (_subTitle !== '') {
              _subTitle += ' ';
            }
            _subTitle += cipher.identity.lastName;
          }
          subTitle = _subTitle
        }
        subTitle = cipher.identity._subTitle
      }
      return subTitle
    }
  }
  function changeMenuContent () {
    const listContainer = document.getElementsByClassName('cs-list-withScroll')[0];
    if (listContainer) {
      const optionsContainer = `
      <div class="dropdown-options-list">
        <div id="OPTION_GENPASS" class="dropdown-option">Generate Password</div>
        <div id="OPTION_TURNOFF" class="dropdown-option">Turn off for this page</div>
        <div id="OPTION_FILLELSE" class="dropdown-option">Fill something else</div>
      </div>`
      listContainer.parentElement.innerHTML = optionsContainer
      document.getElementById('OPTION_GENPASS').onclick = getPasswordGeneration
      document.getElementById('OPTION_FILLELSE').onclick = getSomethingElseToFill
      document.getElementById('OPTION_TURNOFF').addEventListener('click', (e) => {
        e.preventDefault();
        sendPlatformMessage({
          command: 'informMenuTurnOff'
        });
      });
    }
    else {
      document.getElementById('header-title').innerHTML = 'Saved Login'
      const mainContainer = document.getElementsByTagName('main')[0]
      mainContainer.innerHTML = '<div class="cs-list-withScroll"></div>'
      sendPlatformMessage({
        command: 'bgGetDataForTab',
        responseCommand: 'informMenuGetCiphersForCurrentTab'
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
          <span>Use lowercase letters (a-z)</span>
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
  function getSomethingElseToFill () {
    const responseCiphersCommand = 'informMenuGetCiphers'
    document.getElementById('header-title').innerHTML = 'What should be here?'
    const allCategoriesContainer =
    `<div class="cs-categories-list">
      <div id="selection_password" class="selection-category">
        <svg class="category-icon" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z" fill="#3DB249"/>
        <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z" fill="url(#paint0_linear_112_1073)" fill-opacity="0.2"/>
        <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z" fill="black" fill-opacity="0.2"/>
        <path d="M11.75 13.25V26.75" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M17.75 17V20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14.8999 19.0718L17.7499 19.9999" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15.9873 22.4281L17.7498 20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M19.5125 22.4281L17.75 20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M20.6 19.0718L17.75 19.9999" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M26.75 17V20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M23.8999 19.0718L26.7499 19.9999" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M24.9873 22.4281L26.7498 20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M28.5125 22.4281L26.75 20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M29.6 19.0718L26.75 19.9999" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <defs>
        <linearGradient id="paint0_linear_112_1073" x1="4.5" y1="35" x2="40" y2="2.5" gradientUnits="userSpaceOnUse">
        <stop stop-color="#71E97E"/>
        <stop offset="1" stop-color="#71E97E" stop-opacity="0"/>
        </linearGradient>
        </defs>
        </svg>
        Password
      </div>
      <div id="selection_card" class="selection-category">
        <svg class="category-icon" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#61B6F9"/>
        <rect width="40" height="40" rx="8" fill="url(#paint0_linear_112_1079)" fill-opacity="0.2"/>
        <path d="M30.2857 11.4883H9.71429C9.25963 11.4883 8.82359 11.6689 8.5021 11.9904C8.18061 12.3119 8 12.7479 8 13.2026V16.7276V26.9061C8 27.3608 8.18061 27.7968 8.5021 28.1183C8.82359 28.4398 9.25963 28.6204 9.71429 28.6204H30.2857C30.7404 28.6204 31.1764 28.4398 31.4979 28.1183C31.8194 27.7968 32 27.3608 32 26.9061V13.2026C32 12.7479 31.8194 12.3119 31.4979 11.9904C31.1764 11.6689 30.7404 11.4883 30.2857 11.4883ZM20.8571 25.2026H19.1429C18.9155 25.2026 18.6975 25.1123 18.5368 24.9515C18.376 24.7908 18.2857 24.5728 18.2857 24.3454C18.2857 24.1181 18.376 23.9001 18.5368 23.7393C18.6975 23.5786 18.9155 23.4883 19.1429 23.4883H20.8571C21.0845 23.4883 21.3025 23.5786 21.4632 23.7393C21.624 23.9001 21.7143 24.1181 21.7143 24.3454C21.7143 24.5728 21.624 24.7908 21.4632 24.9515C21.3025 25.1123 21.0845 25.2026 20.8571 25.2026ZM27.7143 25.2026H24.2857C24.0584 25.2026 23.8404 25.1123 23.6796 24.9515C23.5189 24.7908 23.4286 24.5728 23.4286 24.3454C23.4286 24.1181 23.5189 23.9001 23.6796 23.7393C23.8404 23.5786 24.0584 23.4883 24.2857 23.4883H27.7143C27.9416 23.4883 28.1596 23.5786 28.3204 23.7393C28.4811 23.9001 28.5714 24.1181 28.5714 24.3454C28.5714 24.5728 28.4811 24.7908 28.3204 24.9515C28.1596 25.1123 27.9416 25.2026 27.7143 25.2026ZM9.71429 15.8704V13.2026H30.2857V15.8704H9.71429Z" fill="white"/>
        <defs>
        <linearGradient id="paint0_linear_112_1079" x1="4.5" y1="35" x2="40" y2="2.5" gradientUnits="userSpaceOnUse">
        <stop stop-color="#225781"/>
        <stop offset="1" stop-color="#225781" stop-opacity="0"/>
        </linearGradient>
        </defs>
        </svg>
        Payment Card
      </div>
      <div id="selection_identity" class="selection-category">
        <svg class="category-icon" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#F54F64"/>
        <rect width="40" height="40" rx="8" fill="url(#paint0_linear_112_1082)" fill-opacity="0.2"/>
        <path d="M20.2197 24.6104C23.2573 24.6104 25.7197 22.1479 25.7197 19.1104C25.7197 16.0728 23.2573 13.6104 20.2197 13.6104C17.1822 13.6104 14.7197 16.0728 14.7197 19.1104C14.7197 22.1479 17.1822 24.6104 20.2197 24.6104Z" fill="white"/>
        <path d="M20.2197 7.11035C17.6486 7.11035 15.1352 7.87279 12.9973 9.30125C10.8595 10.7297 9.19324 12.76 8.2093 15.1355C7.22536 17.5109 6.96792 20.1248 7.46952 22.6465C7.97113 25.1683 9.20926 27.4847 11.0273 29.3027C12.8454 31.1208 15.1618 32.359 17.6836 32.8606C20.2053 33.3622 22.8192 33.1047 25.1946 32.1208C27.5701 31.1368 29.6004 29.4706 31.0288 27.3328C32.4573 25.1949 33.2197 22.6815 33.2197 20.1104C33.2131 16.6646 31.8414 13.3618 29.4048 10.9253C26.9683 8.48872 23.6655 7.11696 20.2197 7.11035ZM28.4447 27.4104C27.6353 26.2492 26.5921 25.27 25.3822 24.5354C23.993 25.8662 22.1436 26.6092 20.2197 26.6092C18.2959 26.6092 16.4464 25.8662 15.0572 24.5354C13.8473 25.27 12.8042 26.2492 11.9947 27.4104C10.587 25.8251 9.66729 23.8667 9.34643 21.771C9.02557 19.6753 9.31718 17.5315 10.1862 15.5977C11.0552 13.6638 12.4645 12.0223 14.2446 10.8706C16.0246 9.71898 18.0996 9.10629 20.2197 9.10629C22.3399 9.10629 24.4148 9.71898 26.1949 10.8706C27.975 12.0223 29.3843 13.6638 30.2533 15.5977C31.1223 17.5315 31.4139 19.6753 31.093 21.771C30.7722 23.8667 29.8525 25.8251 28.4447 27.4104Z" fill="white"/>
        <defs>
        <linearGradient id="paint0_linear_112_1082" x1="4.5" y1="35" x2="40" y2="2.5" gradientUnits="userSpaceOnUse">
        <stop stop-color="#DB1D35"/>
        <stop offset="1" stop-color="#DB1D35" stop-opacity="0"/>
        </linearGradient>
        </defs>
        </svg>
        Personal Information
      </div>
    </div>`
    const mainContainer = document.getElementsByTagName('main')[0]
    mainContainer.innerHTML = allCategoriesContainer
    const categorySelections = ['selection_password', 'selection_card', 'selection_identity']
    for (let i = 0; i < categorySelections.length; i++) {
      const checkboxEl = document.getElementById(categorySelections[i])
      if (checkboxEl) {
        checkboxEl.addEventListener('click', (e) => {
          e.preventDefault();
          sendPlatformMessage({
            command: 'bgGetDataForTab',
            type: i===0?1:i===1?3:4,
            responseCommand: responseCiphersCommand
          });
          const cipherListContainer = `<div class="cs-list-withScroll"></div>`
          mainContainer.innerHTML = cipherListContainer
        });
      }
    }
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
