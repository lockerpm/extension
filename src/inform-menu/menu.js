require('./menu.scss')
document.addEventListener('DOMContentLoaded', () => {
  var i18n = {};
  i18n.informMenuSavedLogin = chrome.i18n.getMessage('informMenuSavedLogin')
  i18n.informMenuVaultLocked = chrome.i18n.getMessage('informMenuVaultLocked')
  i18n.informMenuLoginNow = chrome.i18n.getMessage('informMenuLoginNow')
  i18n.informMenuGeneratePassword = chrome.i18n.getMessage('informMenuGeneratePassword')
  i18n.informMenuTurnOff = chrome.i18n.getMessage('informMenuTurnOff')
  i18n.informMenuFillStElse = chrome.i18n.getMessage('informMenuFillStElse')
  i18n.informMenuUsePassword = chrome.i18n.getMessage('informMenuUsePassword')
  i18n.informMenuLength = chrome.i18n.getMessage('informMenuLength')
  i18n.informMenuUseUpper = chrome.i18n.getMessage('informMenuUseUpper')
  i18n.informMenuUseLower = chrome.i18n.getMessage('informMenuUseLower')
  i18n.informMenuUseDigits = chrome.i18n.getMessage('informMenuUseDigits')
  i18n.informMenuUseSymbols = chrome.i18n.getMessage('informMenuUseSymbols')
  i18n.inforMenuAvoidAmbiguous = chrome.i18n.getMessage('inforMenuAvoidAmbiguous')
  i18n.informMenuPasswordGenerator = chrome.i18n.getMessage('informMenuPasswordGenerator')
  i18n.informMenuNoPassword = chrome.i18n.getMessage('informMenuNoPassword')
  i18n.informMenuFillStElseTitle = chrome.i18n.getMessage('informMenuFillStElseTitle')
  i18n.informMenuCategoryPassword = chrome.i18n.getMessage('informMenuCategoryPassword')
  i18n.informMenuCategoryCard = chrome.i18n.getMessage('informMenuCategoryCard')
  i18n.informMenuCategoryPersonalInfo = chrome.i18n.getMessage('informMenuCategoryPersonalInfo')
  i18n.informMenuScoreStrong = chrome.i18n.getMessage('informMenuScoreStrong')
  i18n.informMenuScoreGood = chrome.i18n.getMessage('informMenuScoreGood')
  i18n.informMenuScoreMedium = chrome.i18n.getMessage('informMenuScoreMedium')
  i18n.informMenuScoreWeak = chrome.i18n.getMessage('informMenuScoreWeak')

  const responseCiphersCommand = 'informMenuGetCiphersForCurrentTab';
  const responseSomethingElse = 'informMenuGetCiphers';
  const responseGeneratePassword = 'informMenuGetGeneratedPassword';
  const responseGeneratePasswordNoOptions = 'informMenuGetGeneratedPasswordNoOptions';
  const generatePasswordOptions = 'setGeneratePasswordOptions';

  setTimeout(load, 50);

  function load() {
    document.querySelector('#template-vault-locked .btn-inform-login').textContent = i18n.informMenuLoginNow
    document.querySelector('#template-vault-locked .cs-inform-no-ciphers').textContent = i18n.informMenuVaultLocked
    document.querySelector('#template-generated-password .use-password').textContent = i18n.informMenuUsePassword
    document.querySelector('#template-generated-password .use-password').textContent = i18n.informMenuUsePassword
    document.querySelector('#template-dropdown-options .generate-password').textContent = i18n.informMenuGeneratePassword
    document.querySelector('#template-dropdown-options .turn-off').textContent = i18n.informMenuTurnOff
    document.querySelector('#template-dropdown-options .fill-st-else').textContent = i18n.informMenuFillStElse
    document.querySelector('#template-generate-password .use-password').textContent = i18n.informMenuUsePassword
    document.querySelector('#template-generate-password .option-length').textContent = i18n.informMenuLength
    document.querySelector('#template-generate-password .option-upper').textContent = i18n.informMenuUseUpper
    document.querySelector('#template-generate-password .option-lower').textContent = i18n.informMenuUseLower
    document.querySelector('#template-generate-password .option-digit').textContent = i18n.informMenuUseDigits
    document.querySelector('#template-generate-password .option-symbol').textContent = i18n.informMenuUseSymbols
    document.querySelector('#template-generate-password .option-ambiguous').textContent = i18n.inforMenuAvoidAmbiguous
    document.querySelector('#template-categories-list .category-password').textContent = i18n.informMenuCategoryPassword
    document.querySelector('#template-categories-list .category-card').textContent = i18n.informMenuCategoryCard
    document.querySelector('#template-categories-list .category-personal-info').textContent = i18n.informMenuCategoryPersonalInfo
    const btnDropdown = document.getElementById('dropdownOptions')
    btnDropdown.onclick = function () {
      changeMenuContent()
    }
    document.getElementById('inform-logo').onclick = function () {
      goToStartPage()
    }
    chrome.runtime.onMessage.addListener((msg) => {
      if ((msg.command === responseCiphersCommand || msg.command === responseSomethingElse) && msg.data) {
        fillMenuWithCiphers(msg.data.ciphers);
      }
      if (msg.command === responseGeneratePassword && msg.data) {
        showGeneratedPassword(msg.data)
      }
      if (msg.command === responseGeneratePasswordNoOptions && msg.data) {
        showGeneratedPasswordNoOptions(msg.data)
      }
      if (msg.command === generatePasswordOptions && msg.data) {
        setGeneratePasswordOptions(msg.data.options)
      }
    });
    if (getQueryVariable('generate')) {
      document.getElementById('header-title').innerHTML = i18n.informMenuPasswordGenerator
      setContent(document.getElementById('template-generated-password'));
      var usePasswordButton = document.querySelector('#template-generated-password-clone .use-password')
      var showPasswordButton = document.querySelector('#template-generated-password-clone .btn-show-password')
      var showOptionsButton = document.querySelector('#template-generated-password-clone .btn-show-options')
      usePasswordButton.addEventListener('click', function () { useGeneratedPassword('input') });
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
      document.getElementById('header-title').innerHTML = i18n.informMenuSavedLogin
      setContent(document.getElementById('template-list-ciphers'));
      sendPlatformMessage({
        command: 'bgGetDataForTab',
        responseCommand: responseCiphersCommand
      });
    }
  }
  function getQueryVariable(variable) {
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
  function setContent(element) {
    const content = document.getElementById('content');
    while (content.firstChild) {
      content.removeChild(content.firstChild);
    }

    var newElement = element.cloneNode(true);
    newElement.id = newElement.id + '-clone';
    content.appendChild(newElement);
  }
  function sendPlatformMessage(msg) {
    chrome.runtime.sendMessage(msg);
  }
  function fillMenuWithCiphers(ciphers) {
    setContent(document.getElementById('template-list-ciphers'));
    const listContainer = document.getElementsByClassName('cs-list-withScroll')[0];
    if (listContainer != null) {
      if (ciphers == null) {
        setContent(document.getElementById('template-vault-locked'));
        document.getElementById('btn-inform-login').addEventListener('click', (e) => {
          e.preventDefault();
          sendPlatformMessage({
            command: 'informMenuLogin'
          });
        });
        return
      }
      if (!ciphers.length) {
        listContainer.innerHTML = `<div class="cs-inform-no-ciphers">${i18n.informMenuNoPassword}</div>`
        return
      }
      for (let i = 0; i < ciphers.length; i++) {
        const cipherRow = document.createElement("div");

        cipherRow.setAttribute('id', ciphers[i].id)
        cipherRow.classList.add('selection-item')

        const cipherRowLeft = document.createElement("div");
        cipherRowLeft.style.cssText = `
          cursor: pointer;
          width: calc(100% - 24px);
        `
        const cipherTitle = document.createElement("div")
        cipherTitle.classList.add("selection-item__title")
        cipherTitle.textContent = ciphers[i].name
        cipherRowLeft.appendChild(cipherTitle)

        const cipherSubtitle = document.createElement("div")
        cipherSubtitle.textContent = getSubTitle(ciphers[i])
        cipherRowLeft.appendChild(cipherSubtitle)

        cipherRow.appendChild(cipherRowLeft)

        const cipherRowRight = document.createElement("div")
        const pinIcon = document.createElement("div")
        pinIcon.classList.add("selection-item__pin-icon")
        pinIcon.style.cssText = `
          background-image: url(${ciphers[i].favorite ? require('@/assets/images/icons/icon_unpin.svg') : require('@/assets/images/icons/icon_pin.svg')});
        `;
        pinIcon.onclick = function () {
          sendPlatformMessage({ command: 'markFavorite', id: cipherRow.id })
        }
        cipherRowRight.appendChild(pinIcon)

        cipherRow.appendChild(cipherRowRight)

        listContainer.appendChild(cipherRow)
        cipherRowLeft.onclick = function () {
          sendPlatformMessage({ command: 'informMenuFillCipher', id: cipherRow.id })
        }
      }
    }
    function getSubTitle(cipher) {
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
  function changeMenuContent() {
    const optionsContainer = document.getElementById('template-dropdown-options-clone');
    if (!optionsContainer) {
      setContent(document.getElementById('template-dropdown-options'))
      sendPlatformMessage({
        command: 'bgResizeInformMenu',
        data: { width: '320px', height: '244px' }
      });
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
      if (getQueryVariable('generate')) {
        document.getElementById('header-title').innerHTML = chrome.i18n.getMessage("informMenuPasswordGenerator")
        setContent(document.getElementById('template-generated-password'));
        var usePasswordButton = document.querySelector('#template-generated-password-clone .use-password')
        var showPasswordButton = document.querySelector('#template-generated-password-clone .btn-show-password')
        var showOptionsButton = document.querySelector('#template-generated-password-clone .btn-show-options')
        usePasswordButton.addEventListener('click', function () { useGeneratedPassword('input') });
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
        document.getElementById('header-title').innerHTML = i18n.informMenuSavedLogin
        setContent(document.getElementById('template-list-ciphers'));
        sendPlatformMessage({
          command: 'bgGetDataForTab',
          responseCommand: responseCiphersCommand
        });
      }
    }
  }
  function goToStartPage() {
    if (getQueryVariable('generate')) {
      document.getElementById('header-title').innerHTML = chrome.i18n.getMessage("informMenuPasswordGenerator")
      setContent(document.getElementById('template-generated-password'));
      var usePasswordButton = document.querySelector('#template-generated-password-clone .use-password')
      var showPasswordButton = document.querySelector('#template-generated-password-clone .btn-show-password')
      var showOptionsButton = document.querySelector('#template-generated-password-clone .btn-show-options')
      usePasswordButton.addEventListener('click', function () { useGeneratedPassword('input') });
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
      document.getElementById('header-title').innerHTML = i18n.informMenuSavedLogin
      setContent(document.getElementById('template-list-ciphers'));
      sendPlatformMessage({
        command: 'bgGetDataForTab',
        responseCommand: responseCiphersCommand
      });
    }
  }
  function getPasswordGeneration() {
    setContent(document.getElementById('template-generate-password'))
    document.getElementById('header-title').innerHTML = chrome.i18n.getMessage("informMenuPasswordGenerator")
    const passwordSlider = document.getElementById('password_length_slider')
    const checkboxArray = ['password_length_slider', 'checkbox_use_upper', 'checkbox_use_lower', 'checkbox_use_digits', 'checkbox_use_symbols', 'checkbox_avoid_ambiguous']
    if (passwordSlider) {
      passwordSlider.oninput = () => {
        document.getElementById('')
      }
    }
    document.getElementById('button_use_password').addEventListener('click', () => {
      useGeneratedPassword()
    })
    document.getElementById('button_regenerate').addEventListener('click', () => {
      bgGeneratePassword(true)
    })
    for (let i = 0; i < checkboxArray.length; i++) {
      const checkboxEl = document.getElementById(checkboxArray[i])
      if (checkboxEl) {
        checkboxEl.addEventListener('change', () => {
          bgGeneratePassword(true)
        })
      }
    }
    bgGeneratePassword()
  }
  function getSomethingElseToFill() {
    document.getElementById('header-title').innerHTML = i18n.informMenuFillStElseTitle
    const mainContainer = document.getElementsByTagName('main')[0]
    setContent(document.getElementById('template-categories-list'))
    const categorySelections = ['selection_password', 'selection_card', 'selection_identity']
    for (let i = 0; i < categorySelections.length; i++) {
      const checkboxEl = document.getElementById(categorySelections[i])
      if (checkboxEl) {
        checkboxEl.addEventListener('click', (e) => {
          e.preventDefault();
          sendPlatformMessage({
            command: 'bgGetDataForTab',
            type: i === 0 ? 1 : i === 1 ? 3 : 4,
            responseCommand: responseSomethingElse
          });
          const cipherListContainer = `<div class="cs-list-withScroll"></div>`
          mainContainer.innerHTML = cipherListContainer
        });
      }
    }
  }
  function showGeneratedPasswordNoOptions(passwordData) {
    document.querySelector('#template-generated-password-clone .generated-password').value = passwordData.password
  }
  function showGeneratedPassword(passwordData) {
    let color = '#000000'
    let textStrength = ''
    switch (passwordData.passwordStrength.score) {
    case 4:
      color = '#3DB249'
      textStrength = i18n.informMenuScoreStrong
      break;
    case 3:
      color = '#0363C2'
      textStrength = i18n.informMenuScoreGood
      break;
    case 2:
      color = '#FF9800'
      textStrength = i18n.informMenuScoreMedium
      break;
    case 1:
    case 0:
      color = '#F54F64'
      textStrength = i18n.informMenuScoreWeak
      break;
    default:
      break;
    }
    document.getElementById('password_strength').style.color = color
    document.getElementById('password_strength_text').innerHTML = textStrength
    document.getElementById('password_length').innerHTML = passwordData.password.length
    document.getElementById('generated_password').innerHTML = passwordData.password
  }
  function bgGeneratePassword(isReplace = false) {
    const generateOptions = getGeneratePasswordOptions()
    sendPlatformMessage({
      command: 'bgGeneratePassword',
      responseCommand: responseGeneratePassword,
      isReplace,
      options: generateOptions
    });
  }

  function setGeneratePasswordOptions(options) {
    const lengthEl = document.getElementById('password_length_slider')
    const uppercaseEl = document.getElementById('checkbox_use_upper')
    const lowercaseEl = document.getElementById('checkbox_use_lower')
    const numberEl = document.getElementById('checkbox_use_digits')
    const specialEl = document.getElementById('checkbox_use_symbols')
    const ambiguousEl = document.getElementById('checkbox_avoid_ambiguous')
    lengthEl.value = Number(options.length);
    uppercaseEl.checked = options.uppercase;
    lowercaseEl.checked = options.lowercase;
    numberEl.checked = options.number;
    specialEl.checked = options.special;
    ambiguousEl.checked = options.ambiguous;
  }

  function getGeneratePasswordOptions() {
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
  function useGeneratedPassword(type = 'div') {
    let password = ''
    if (type === 'input') {
      password = document.querySelector('#template-generated-password-clone .generated-password').value
    } else {
      password = document.getElementById('generated_password').textContent
    }
    sendPlatformMessage({
      command: 'informMenuUsePassword',
      password: password
    })
  }
})
