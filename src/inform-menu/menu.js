require('./menu.scss')
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(load, 50);

  function load () {
    const responseCiphersCommand = 'informMenuGetCiphersForCurrentTab';
    const responseSomethingElse = 'informMenuGetCiphers'
    const responseGeneratePassword = 'informMenuGetGeneratedPassword'
    const responseGeneratePasswordNoOptions = 'informMenuGetGeneratedPasswordNoOptions'
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
      if (msg.command === responseGeneratePasswordNoOptions && msg.data) {
        showGeneratedPasswordNoOptions(msg.data)
      }
      if (msg.command === responseSomethingElse && msg.data) {
        fillMenuWithCiphers(msg.data.ciphers)
      }
    });
    if (getQueryVariable('generate')) {
      document.getElementById('header-title').innerHTML = 'Password Generator'
      setContent(document.getElementById('template-generated-password'));
      var usePasswordButton = document.querySelector('#template-generated-password-clone .use-password')
      var showPasswordButton = document.querySelector('#template-generated-password-clone .btn-show-password')
      var showOptionsButton = document.querySelector('#template-generated-password-clone .btn-show-options')
      usePasswordButton.addEventListener('click', useGeneratedPassword);
      showPasswordButton.addEventListener('click', () => {
        var inputEl = document.querySelector('#template-generated-password-clone .generated-password')
        inputEl.type = inputEl.type === 'password' ? 'text' : 'password'
      });
      showOptionsButton.addEventListener('click', getPasswordGeneration);
      sendPlatformMessage({
        command: 'bgGeneratePassword',
        responseCommand: responseGeneratePasswordNoOptions
      });
    }
    else {
      setContent(document.getElementById('template-list-ciphers'));
      sendPlatformMessage({
        command: 'bgGetDataForTab',
        responseCommand: responseCiphersCommand
      });
    }
  }
  function getQueryVariable (variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');

    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (pair[0] === variable) {
        return pair[1];
      }
    }

    return null;
  }
  function setContent (element) {
    const content = document.getElementById('content');
    while (content.firstChild) {
      content.removeChild(content.firstChild);
    }

    var newElement = element.cloneNode(true);
    newElement.id = newElement.id + '-clone';
    content.appendChild(newElement);
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
    const optionsContainer = document.getElementById('template-dropdown-options-clone');
    if (!optionsContainer) {
      setContent(document.getElementById('template-dropdown-options'))
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
      // document.getElementById('header-title').innerHTML = 'Saved Login'
      // const mainContainer = document.getElementsByTagName('main')[0]
      // mainContainer.innerHTML = '<div class="cs-list-withScroll"></div>'
      // sendPlatformMessage({
      //   command: 'bgGetDataForTab',
      //   responseCommand: 'informMenuGetCiphersForCurrentTab'
      // });
      if (getQueryVariable('generate')) {
        document.getElementById('header-title').innerHTML = 'Password Generator'
        setContent(document.getElementById('template-generated-password'));
        var usePasswordButton = document.querySelector('#template-generated-password-clone .use-password')
        var showPasswordButton = document.querySelector('#template-generated-password-clone .btn-show-password')
        var showOptionsButton = document.querySelector('#template-generated-password-clone .btn-show-options')
        usePasswordButton.addEventListener('click', useGeneratedPassword);
        showPasswordButton.addEventListener('click', () => {
          var inputEl = document.querySelector('#template-generated-password-clone .generated-password')
          inputEl.type = inputEl.type === 'password' ? 'text' : 'password'
        });
        showOptionsButton.addEventListener('click', getPasswordGeneration);
        sendPlatformMessage({
          command: 'bgGeneratePassword',
          responseCommand: 'informMenuGetGeneratedPasswordNoOptions'
        });
      }
      else {
        setContent(document.getElementById('template-list-ciphers'));
        sendPlatformMessage({
          command: 'bgGetDataForTab',
          responseCommand: 'informMenuGetCiphersForCurrentTab'
        });
      }
    }
  }
  function getPasswordGeneration () {
    setContent(document.getElementById('template-generate-password'))
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
    const mainContainer = document.getElementsByTagName('main')[0]
    // mainContainer.innerHTML = allCategoriesContainer
    setContent(document.getElementById('template-categories-list'))
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
  function showGeneratedPasswordNoOptions (passwordData) {
    document.querySelector('#template-generated-password-clone .generated-password').value = passwordData.password
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
