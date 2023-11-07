import AddLoginRuntimeMessage from 'src/background/models/addLoginRuntimeMessage';
import ChangePasswordRuntimeMessage from 'src/background/models/changePasswordRuntimeMessage';
import { CipherType } from "jslib-common/enums/cipherType";

import {
  OBSERVE_IGNORED_ELEMENTS,
  CANCEL_BUTTON_NAMES,
  LOGIN_BUTTON_NAMES,
  SIGN_UP_BUTTON_NAMES,
  CHANGE_PASSWORD_BUTTON_NAMES,
  CHANGE_PASSWORD_BUTTON_CONTAINS_NAMES
} from '@/config/constants'
document.addEventListener('DOMContentLoaded', event => {
  const hideDomains = process.env.VUE_APP_HIDE_DOMAINS
  if (hideDomains.includes(self.location.hostname)) {
    return;
  }
  let currentMessage: any = null
  const formData: any[] = [];
  let pageHref: string = null;
  let observer: MutationObserver = null;
  let domObservationCollectTimeout: number = null;
  let collectIfNeededTimeout: number = null;
  let observeDomTimeout: number = null;
  let disabledAddLoginNotification = false;
  let disabledChangedPasswordNotification = false;
  let isSignUp = false
  const observeIgnoredElements = new Set(OBSERVE_IGNORED_ELEMENTS);
  const cancelButtonNames = new Set(CANCEL_BUTTON_NAMES);
  const loginButtonNames = new Set(LOGIN_BUTTON_NAMES);
  const signUpButtonNames = new Set(SIGN_UP_BUTTON_NAMES);
  const changePasswordButtonNames = new Set(CHANGE_PASSWORD_BUTTON_NAMES);
  const changePasswordButtonContainsNames = new Set(CHANGE_PASSWORD_BUTTON_CONTAINS_NAMES);

  function sendPlatformMessage(msg: any) {
    chrome.runtime.sendMessage(msg);
  }

  chrome.storage.local.get('disableAddLoginNotification', (disAddObj: any) => {
    disabledAddLoginNotification = disAddObj != null && disAddObj.disableAddLoginNotification === true;
    chrome.storage.local.get('disableChangedPasswordNotification', (disChangedObj: any) => {
      disabledChangedPasswordNotification = disChangedObj != null &&
        disChangedObj.disableChangedPasswordNotification === true;
      if (!disabledAddLoginNotification || !disabledChangedPasswordNotification) {
        collectIfNeededWithTimeout();
      }
    });
  });

  chrome.runtime.onMessage.addListener((msg: any, sender: any, sendResponse: Function) => {
    if (!!currentMessage && JSON.stringify(currentMessage) === JSON.stringify(msg)) {
      return;
    }
    currentMessage = msg;
    processMessages(msg, sendResponse);
  });

  function processMessages(msg: any, sendResponse: Function) {
    if (msg.command === 'openNotificationBar') {
      closeExistingAndOpenBar(msg.data.type, msg.data.loginInfo);
    } else if (msg.command === 'closeNotificationBar') {
      closeBar(true);
    } else if (msg.command === 'notificationBarPageDetails') {
      watchForms(msg.data.forms);
      chrome.storage.local.get('enableAutofill', (autofillObj: any) => {
        if (autofillObj && autofillObj.enableAutofill === false) return;
        for (let i = 0; i < msg.data.passwordFields.length; i++) {
          if (msg.data.passwordFields[i]) {
            try {
              setFillLogo(msg.data.passwordFields[i], "password", msg.data.isLocked)
            } catch (error) {
            }
          }
        }
        for (let i = 0; i < msg.data.usernameFields.length; i++) {
          if (msg.data.usernameFields[i]) {
            try {
              setFillLogo(msg.data.usernameFields[i], "username", msg.data.isLocked)
            } catch (error) {
            }
          }
        }
        for (let i = 0; i < msg.data.forms.length; i++) {
          const form = msg.data.forms[i];
          if (form.otps?.length === 1) {
            setFillLogo(form.otps[0], "otp", msg.data.isLocked)
          } else if (form.otps.length === 6) {
            setFillLogo(form.otps[5], "otp", msg.data.isLocked, true)
          }
        }
      })
    } else if (msg.command === "closeInformMenu") {
      closeAllInformMenu()
    } else if (msg.command === 'openPopupIframe') {
      openPopupIframe()
    } else if (msg.command === 'closePopupIframe') {
      closePopupIframe()
    } else if (msg.command === 'resizeMenuInfo') {
      const menuEls: any = document.getElementsByClassName('cs-inform-menu-iframe');
      if (menuEls && menuEls.length > 0) {
        for (let i = 0; i < menuEls.length; i += 1) {
          menuEls[i].style.setProperty('height', `${msg.data.height}px`, '');
        };
      }
    }
    sendResponse();
    return true;
  }

  function observeDom() {
    const bodies = document.querySelectorAll('body');
    if (bodies && bodies.length > 0) {
      observer = new MutationObserver(mutations => {
        if (mutations == null || mutations.length === 0 || pageHref !== self.location.href) {
          return;
        }

        let doCollect = false;
        for (let i = 0; i < mutations.length; i++) {
          const mutation = mutations[i];
          if (mutation.addedNodes == null || mutation.addedNodes.length === 0) {
            continue;
          }

          for (let j = 0; j < mutation.addedNodes.length; j++) {
            const addedNode: any = mutation.addedNodes[j];
            if (addedNode == null) {
              continue;
            }

            const tagName = addedNode.tagName != null ? addedNode.tagName.toLowerCase() : null;
            if (tagName != null && tagName === 'form' &&
              (addedNode.dataset == null || !addedNode.dataset.lockerWatching)) {
              doCollect = true;
              break;
            }

            if ((tagName != null && observeIgnoredElements.has(tagName)) ||
              addedNode.querySelectorAll == null) {
              continue;
            }

            const forms = addedNode.querySelectorAll('form:not([data-locker-watching])');
            if (forms != null && forms.length > 0) {
              doCollect = true;
              break;
            }
          }

          if (doCollect) {
            break;
          }
        }
        if (doCollect) {
          if (domObservationCollectTimeout != null) {
            self.clearTimeout(domObservationCollectTimeout);
          }
          domObservationCollectTimeout = self.setTimeout(() => {
            sendPlatformMessage({
              command: 'bgCollectPageDetails',
              sender: 'notificationBar',
            });
          }, 1000);
        }
      });
      observer.observe(bodies[0], { childList: true, subtree: true, attributeFilter: ['style'] });
    }
  }

  function collectIfNeededWithTimeout() {
    if (collectIfNeededTimeout != null) {
      self.clearTimeout(collectIfNeededTimeout);
    }
    collectIfNeededTimeout = self.setTimeout(collectIfNeeded, 1000);
  }

  function collectIfNeeded() {
    if (pageHref !== self.location.href) {
      pageHref = self.location.href;
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      sendPlatformMessage({
        command: 'bgCollectPageDetails',
        sender: 'notificationBar',
      });
      if (observeDomTimeout != null) {
        self.clearTimeout(observeDomTimeout);
      }
      observeDomTimeout = self.setTimeout(observeDom, 1000);
    } else {
      if (collectIfNeededTimeout != null) {
        self.clearTimeout(collectIfNeededTimeout);
      }
      collectIfNeededTimeout = self.setTimeout(collectIfNeeded, 1000);
    }
  }

  function watchForms(forms: any[]) {
    if (forms == null || forms.length === 0) {
      return;
    }

    forms.forEach((f: any) => {
      const formId: string = f.form != null ? f.form.htmlID : null;
      let formEl: HTMLFormElement = null;
      if (formId != null && formId !== '') {
        formEl = document.getElementById(formId) as HTMLFormElement;
      }

      if (formEl == null) {
        const index = parseInt(f.form.opid.split('__')[2], null);
        formEl = document.getElementsByTagName('form')[index];
      }
      if (formEl != null && formEl.dataset.lockerWatching !== '1') {
        const formDataObj: any = {
          data: f,
          formEl: formEl,
          usernameEl: null,
          passwordEl: null,
          passwordEls: null,
        };
        locateFields(formDataObj);
        formData.push(formDataObj);
        listen(formEl);
        formEl.dataset.lockerWatching = '1';
      }
    });
  }

  function setFillLogo(el, type = 'password', isLocked = false, isOver = false) {
    const inputEl : any = document.querySelector(`[locker-id="${el.lockerId}"]`)
    if (inputEl && getComputedStyle(inputEl).display !== 'none') {
      closeInformMenu(el)
      const elPosition = inputEl.getBoundingClientRect();      
      let relativeContainer = inputEl.parentElement
      if (relativeContainer) {
        relativeContainer.style.position = 'relative'
      }
      if (relativeContainer) {
        const containerPosition = relativeContainer.getBoundingClientRect();
        removeFillLogo(el)
        const logo = document.createElement("span");
        logo.id = 'cs-logo-' + el.lockerId;
        logo.style.cssText = `
          position: absolute;
          height: 19px;
          width: 19px;
          background-position: center;
          background-size: contain;
          z-index: 1000 !important;
          cursor: pointer;
        `;
        document.addEventListener('click', (e: any) => {
          const menuEl = document.getElementById(`cs-inform-menu-iframe-${el.lockerId}`);
          if (logo.contains(e.target)) {
            if (!menuEl) {
              openInformMenu(inputEl, type, isOver);
            } else {
              menuEl.parentElement.removeChild(menuEl)
            }
          } else {
            if (menuEl) {
              menuEl.parentElement.removeChild(menuEl);
            }
          }
        })
        inputEl.parentNode.insertBefore(logo, inputEl.nextElementSibling);
        if (isOver) {
          logo.style.right = `-28px`;
          logo.style.top = `20px`;
        } else if (elPosition.width <= 0) {
          logo.style.right = `16px`;
          logo.style.top = `20px`;
        } else {
          logo.style.left = `${elPosition.left - containerPosition.left + elPosition.width - 30}px`;
          logo.style.top = `${elPosition.top - containerPosition.top + (elPosition.height - 20) / 2}px`
        }
        if (isLocked) {
          const image = 'data:image/png;base64,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'
          logo.style.backgroundImage = `url('${image}')`;
        } else {
          const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAMAAABFjsb+AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABIFBMVEVirVYAAABirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVZirVb///+8vCC1AAAAXnRSTlMAABVEc5/B2urx8vDo17+eckITBJj0/fORAgi6+tb3swW5+VHesWPV+9JI3fZLx7XZUk1OvsBPwnHGSga0zYrOrZus50XclFv8jVMQtq8NKswmLcMoHqMbCmpkMKgrHCXsWAAAAAFiS0dEX3PRUS0AAAAHdElNRQflDBcJLw3hH93pAAAA1klEQVQY02NgYGJmYWVj5+Dk4ubh5eMXEBRiYBAWERWLQwAxcQlJBilpCEdGVg7CkFdgkFKM41ACMjmUVSBiqiAxOTX1OA1NFS1tJDEdXT19A0M2XRQxIz5jEyNTdDEzLGJGmGLmFpZWfEhi1jY6VrY63Hb2VlAxB2EGBkcxJx4g09nFFSLmxsDA4O4BZnJ6ckD84wUU8/aJQwa+fkAxBv8AJCHLQAYwCAqGC5mEgAQYgTg0TANiFn84WIQRJBgRCbLUIEoKJAQSAwkyRMdwhMWC9TEyAgDPwE6YM2fCkQAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMS0xMi0yM1QwOTo0NzowOCswMDowMBHsN8QAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjEtMTItMjNUMDk6NDc6MDgrMDA6MDBgsY94AAAAAElFTkSuQmCC'
          logo.style.backgroundImage = `url('${image}')`;
        }
      }
    }
  }

  function closeInformMenu(el: any) {
    const menuEl = document.getElementById(`cs-inform-menu-iframe-${el.lockerId}`);
    if (menuEl) {
      menuEl.parentElement.removeChild(menuEl);
    }
  }

  function removeFillLogo(el: any) {
    const fillLogo = document.getElementById('cs-logo-' + el.lockerId);
    if (fillLogo) {
      fillLogo.parentElement.removeChild(fillLogo);
    }
  }

  function closeAllInformMenu() {
    const menuEls = document.getElementsByClassName('cs-inform-menu-iframe');
    if (menuEls && menuEls.length > 0) {
      for (let i = 0; i < menuEls.length; i += 1) {
        menuEls[i].remove();
      };
    }
  }

  function openInformMenu(inputEl: any, type: string = 'password', isOver: Boolean = false) {    
    if (!document.body) {
      return;
    }
    closeAllInformMenu()
    const elPosition = inputEl.getBoundingClientRect();
    const iframeClass = 'cs-inform-menu-iframe';
    const iframeId = `cs-inform-menu-iframe-${inputEl.getAttribute('locker-id')}`
    let defaultType = 0, defaultTab = 2
    if (isSignUp && type === 'password') {
      defaultTab = 1
    } else if (type === 'otp') {
      defaultTab = 2
      defaultType = CipherType.OTP
    }
    const barPageUrl: string = chrome.runtime.getURL(
      "popup.html#/menu" + `?tab=${defaultTab}&type=${defaultType}`
    );
    const iframe = document.createElement("iframe");
    iframe.id = iframeId;
    iframe.className = iframeClass;
    iframe.style.cssText = `
      top: ${!isOver ? (getOffsetTop(inputEl) + elPosition.height + 10) : (getOffsetTop(inputEl) + elPosition.height / 2 + 18)}px;
      left: ${!isOver ? getOffsetLeft(inputEl) : (getOffsetLeft(inputEl) + inputEl.offsetWidth + 10) }px;
      position: absolute;
      height: ${ defaultTab === 1 ? 428 : 300}px;
      min-width: 300px;
      width: ${elPosition.width}px !important;
      border: 0;
      min-height: initial;
      padding: 0;
      z-index: 2147483647; visibility: visible;
      box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 16px;
      z-index: 2147483647 !important;
      display: block !important;
      visibility: visible !important;
      clip-path: none !important;
      clip: auto !important;
      mask: none !important;
      filter: none !important;
      pointer-events: auto !important;
      resize: none !important;
      border-width: 0px;
      border-style: initial;
      border-color: initial;
      border-image: initial;
      border-radius: 4px;
      margin: 0px !important;
      padding: 0px !important;
    `;
    iframe.src = barPageUrl;
    document.body.appendChild(iframe);
    (iframe.contentWindow.location as any) = barPageUrl;
  }

  function listen(form: HTMLFormElement) {
    form.removeEventListener('submit', formSubmitted, false);
    form.addEventListener('submit', formSubmitted, false);
    const submitButton = getSubmitButton(form, loginButtonNames);
    if (submitButton != null) {
      const buttonText = getButtonText(submitButton);
      const matches = Array.from(signUpButtonNames)
        .filter(n => buttonText.toLowerCase().indexOf(n) > -1);
      if (matches.length > 0) {
        isSignUp = true;
      }
      submitButton.removeEventListener('click', formSubmitted, false);
      submitButton.addEventListener('click', formSubmitted, false);
    }
  }

  function locateFields(formDataObj: any) {
    const inputs = Array.from(document.getElementsByTagName('input'));
    formDataObj.usernameEl = locateField(formDataObj.formEl, formDataObj.data.username, inputs);
    if (formDataObj.usernameEl != null && formDataObj.data.password != null) {
      formDataObj.passwordEl = locatePassword(formDataObj.formEl, formDataObj.data.password, inputs, true);
    } else if (formDataObj.data.passwords != null) {
      formDataObj.passwordEls = [];
      formDataObj.data.passwords.forEach((pData: any) => {
        const el = locatePassword(formDataObj.formEl, pData, inputs, false);
        if (el != null) {
          formDataObj.passwordEls.push(el);
        }
      });
      if (formDataObj.passwordEls.length === 0) {
        formDataObj.passwordEls = null;
      }
    }
  }

  function locatePassword(form: HTMLFormElement, passwordData: any, inputs: HTMLInputElement[],
    doLastFallback: boolean) {
    let el = locateField(form, passwordData, inputs);
    if (el != null && el.type !== 'password') {
      el = null;
    }
    if (doLastFallback && el == null) {
      el = form.querySelector('input[type="password"]');
    }
    return el;
  }

  function locateField(form: HTMLFormElement, fieldData: any, inputs: HTMLInputElement[]) {
    if (fieldData == null) {
      return;
    }
    let el: HTMLInputElement = null;
    if (fieldData.htmlID != null && fieldData.htmlID !== '') {
      try {
        el = form.querySelector('#' + fieldData.htmlID);
      } catch { }
    }
    if (el == null && fieldData.htmlName != null && fieldData.htmlName !== '') {
      el = form.querySelector('input[name="' + fieldData.htmlName + '"]');
    }
    if (el == null && fieldData.elementNumber != null) {
      el = inputs[fieldData.elementNumber];
    }
    return el;
  }

  function formSubmitted(e: Event) {
    closeAllInformMenu();
    let form: HTMLFormElement = null;
    if (e.type === 'click') {
      form = (e.target as HTMLElement).closest('form');
      if (form == null) {
        const parentModal = (e.target as HTMLElement).closest('div.modal');
        if (parentModal != null) {
          const modalForms = parentModal.querySelectorAll('form');
          if (modalForms.length === 1) {
            form = modalForms[0];
          }
        }
      }
    } else {
      form = e.target as HTMLFormElement;
    }

    if (form == null || form.dataset.lockerProcessed === '1') {
      return;
    }

    for (let i = 0; i < formData.length; i++) {
      if (formData[i].formEl !== form) {
        continue;
      }
      const disabledBoth = disabledChangedPasswordNotification && disabledAddLoginNotification;
      if (!disabledBoth && formData[i].usernameEl != null && formData[i].passwordEl != null) {
        const login: AddLoginRuntimeMessage = {
          username: formData[i].usernameEl.value,
          password: formData[i].passwordEl.value,
          url: document.URL,
        };

        if (login.username != null && login.username !== '' &&
          login.password != null && login.password !== '') {
          processedForm(form);
          sendPlatformMessage({
            command: 'bgAddLogin',
            login: login,
          });
          break;
        }
      }
      if (!disabledChangedPasswordNotification && formData[i].passwordEls != null) {
        const passwords: string[] = formData[i].passwordEls
          .filter((el: HTMLInputElement) => el.value != null && el.value !== '')
          .map((el: HTMLInputElement) => el.value);

        let curPass: string = null;
        let newPass: string = null;
        let newPassOnly = false;
        if (formData[i].passwordEls.length === 3 && passwords.length === 3) {
          newPass = passwords[1];
          if (passwords[0] !== newPass && newPass === passwords[2]) {
            curPass = passwords[0];
          } else if (newPass !== passwords[2] && passwords[0] === newPass) {
            curPass = passwords[2];
          }
        } else if (formData[i].passwordEls.length === 2 && passwords.length === 2) {
          if (passwords[0] === passwords[1]) {
            newPassOnly = true;
            newPass = passwords[0];
            curPass = null;
          } else {
            const buttonText = getButtonText(getSubmitButton(form, changePasswordButtonNames));
            const matches = Array.from(changePasswordButtonContainsNames)
              .filter(n => buttonText.indexOf(n) > -1);
            if (matches.length > 0) {
              curPass = passwords[0];
              newPass = passwords[1];
            }
          }
        }

        if (newPass != null && curPass != null || (newPassOnly && newPass != null)) {
          processedForm(form);

          const changePasswordRuntimeMessage: ChangePasswordRuntimeMessage = {
            newPassword: newPass,
            currentPassword: curPass,
            url: document.URL,
          };
          sendPlatformMessage({
            command: 'bgChangedPassword',
            data: changePasswordRuntimeMessage,
          });
          break;
        }
      }
    }
  }

  function getSubmitButton(wrappingEl: HTMLElement, buttonNames: Set<string>) {
    if (wrappingEl == null) {
      return null;
    }
    const wrappingElIsForm = wrappingEl.tagName.toLowerCase() === 'form';
    let submitButton = wrappingEl.querySelector('input[type="submit"], input[type="image"], ' +
      'button[type="submit"]') as HTMLElement;
    if (submitButton == null && wrappingElIsForm) {
      submitButton = wrappingEl.querySelector('button:not([type])');
      if (submitButton != null) {
        const buttonText = getButtonText(submitButton);
        if (buttonText != null && cancelButtonNames.has(buttonText.trim().toLowerCase())) {
          submitButton = null;
        }
      }
    }
    if (submitButton == null) {
      const possibleSubmitButtons = Array.from(wrappingEl.querySelectorAll('a, span, button[type="button"], ' +
        'input[type="button"], button:not([type])')) as HTMLElement[];
      let typelessButton: HTMLElement = null;
      possibleSubmitButtons.forEach(button => {
        if (submitButton != null || button == null || button.tagName == null) {
          return;
        }
        const buttonText = getButtonText(button);
        if (buttonText != null) {
          if (typelessButton != null && button.tagName.toLowerCase() === 'button' &&
            button.getAttribute('type') == null &&
            !cancelButtonNames.has(buttonText.trim().toLowerCase())) {
            typelessButton = button;
          } else if (buttonNames.has(buttonText.trim().toLowerCase())) {
            submitButton = button;
          }
        }
      });
      if (submitButton == null && typelessButton != null) {
        submitButton = typelessButton;
      }
    }
    if (submitButton == null && wrappingElIsForm) {
      // Maybe it's in a modal?
      const parentModal = wrappingEl.closest('div.modal') as HTMLElement;
      if (parentModal != null) {
        const modalForms = parentModal.querySelectorAll('form');
        if (modalForms.length === 1) {
          submitButton = getSubmitButton(parentModal, buttonNames);
        }
      }
    }
    return submitButton;
  }

  function getButtonText(button: HTMLElement) {
    let buttonText: string = null;
    if (button.tagName.toLowerCase() === 'input') {
      buttonText = (button as HTMLInputElement).value;
    } else {
      buttonText = button.innerText;
    }
    return buttonText;
  }

  function processedForm(form: HTMLFormElement) {
    form.dataset.lockerProcessed = '1';
    self.setTimeout(() => {
      form.dataset.lockerProcessed = '0';
    }, 500);
  }

  function closeExistingAndOpenBar(type: string, loginInfo: any) {
    let barPage = 'popup.html#/bar';
    switch (type) {
      case 'add':
        barPage = barPage + '?id=' + '&username=' + encodeURIComponent(loginInfo.username) + '&password=' + encodeURIComponent(loginInfo.password) + '&uri=' + encodeURIComponent(loginInfo.domain);
        break;
      case 'change':
        barPage = barPage + '?id=' + encodeURIComponent(loginInfo.cipherId) + '&username=' + encodeURIComponent(loginInfo.username) + '&password=' + encodeURIComponent(loginInfo.newPassword) + '&uri=' + encodeURIComponent(loginInfo.domain);
        break;
      default:
        break;
    }
    closeBar();
    setTimeout(() => {
      openBar(type, barPage);
    }, 500);
  }

  function openBar(type: string, barPage: string) {
    if (document.body == null) {
      return;
    }
    const barPageUrl: string = chrome.runtime.getURL(barPage);
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
      height: ${type === 'add' ? '338' : '278'}px !important;
      width: 400px;
      border: 0;
      min-height: initial;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 10%), 0 4px 6px -4px rgb(0 0 0 / 10%);
      border-radius: 4px;
    `;
    iframe.id = 'bit-notification-bar-iframe';
    iframe.src = barPageUrl;

    const frameDiv = document.createElement('div');
    frameDiv.setAttribute('aria-live', 'polite');
    frameDiv.id = 'bit-notification-bar';
    frameDiv.style.cssText = `
      height: ${type === 'add' ? '308' : '248'}px !important;
      width: 400px;
      top: 40px;
      right: 40px;
      padding: 0;
      position: fixed;
      z-index: 2147483647;
      visibility: visible;
    `
    frameDiv.appendChild(iframe);
    document.body.appendChild(frameDiv);

    (iframe.contentWindow.location as any) = barPageUrl;
  }

  function closeBar(explicitClose: boolean = false) {
    const iframeEls = document.querySelectorAll('#bit-notification-bar');
    for (let i = 0; i < iframeEls.length; i++) {
      iframeEls[i].parentElement.removeChild(iframeEls[i]);
    }

    if (explicitClose) {
      sendPlatformMessage({
        command: 'bgCloseNotificationBar',
      })
    }
  }

  function getOffsetTop(elem) {
    var offsetLeft = 0;
    do {
      if (!isNaN(elem.offsetTop)) {
        offsetLeft += elem.offsetTop;
      }
    } while ((elem = elem.offsetParent));
    return offsetLeft;
  }

  function getOffsetLeft(elem) {
    var offsetLeft = 0;
    do {
      if (!isNaN(elem.offsetLeft)) {
        offsetLeft += elem.offsetLeft;
      }
    } while ((elem = elem.offsetParent));
    return offsetLeft;
  }

  function closePopupIframe() {
    let frameDiv = document?.getElementById('locker_popup-iframe-container');
    if (frameDiv) {
      frameDiv.remove();
    }
  }

  function openPopupIframe() {
    closePopupIframe()
    if (document.body == null) {
      return;
    }
    let frameDiv = document.getElementById('locker_popup-iframe-container');
    let barPageUrl: string = chrome.runtime.getURL('popup.html');
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
      height: 602px;
      width: 402px;
      border: 1px solid rgb(189 190 190);
      background-color: white
    `;
    iframe.id = 'popup-iframe';
    iframe.src = barPageUrl;
    frameDiv = document.createElement('div');
    frameDiv.id = 'locker_popup-iframe-container';
    frameDiv.style.cssText = `
      height: 600px;
      width: 402px;
      top: 40px;
      right: 40px;
      position: fixed;
      z-index: 2147483647;
      visibility: visible;
    `;
    frameDiv.appendChild(iframe);
    document.addEventListener('click', function (e: any) {
      if (frameDiv.contains(e.target)) {
      } else {
        closePopupIframe();
      }
    });
    document.body.appendChild(frameDiv);

    (iframe.contentWindow.location as any) = barPageUrl;
  }
});
