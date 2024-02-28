import "@webcomponents/custom-elements";
import "lit/polyfill-support.js";
import AddLoginRuntimeMessage from 'src/background/models/addLoginRuntimeMessage';
import ChangePasswordRuntimeMessage from 'src/background/models/changePasswordRuntimeMessage';
import { generateRandomCustomElementName, setElementStyles } from '@/utils';
import {
  AutofillMenuListIframe,
} from './menuIframe';

import { CipherType } from "jslib-common/enums/cipherType";

import {
  OBSERVE_IGNORED_ELEMENTS,
  CANCEL_BUTTON_NAMES,
  LOGIN_BUTTON_NAMES,
  SIGN_UP_BUTTON_NAMES,
  CHANGE_PASSWORD_BUTTON_NAMES,
  CHANGE_PASSWORD_BUTTON_CONTAINS_NAMES
} from '@/config/constants'

const documents = [];

const menuIconTagName = generateRandomCustomElementName();

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

let menuElement: HTMLElement;
let menuIconElement: HTMLElement;

let selectedInput: any;

const customElementDefaultStyles: Partial<CSSStyleDeclaration> = {
  all: "initial",
  position: "fixed",
  display: "block",
  zIndex: "2147483647",
};

let menuElementsMutationObserver: MutationObserver = new MutationObserver(
  handleOverlayElementMutationObserverUpdate,
);;

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

function initMenuIcon(inputEl: HTMLElement, type = 'password', isLocked = false, isOver = false) {
  removeFillLogo();
  const logo = document.createElement("img");
  let imageUrl = chrome.runtime.getURL('icons/48.png')
  if (isLocked) {
    imageUrl = chrome.runtime.getURL('icons/locked.png')
  }
  logo.src = imageUrl;
  logo.className = 'cs-menu-icon';
  logo.addEventListener('click', (event: any) => {
    openInformMenu(inputEl, type)
  })
  menuIconElement = globalThis.document.createElement(menuIconTagName);
  menuIconElement.appendChild(logo)
  const menuIconPositionStyles = getMenuIconPosition(inputEl)
  updateCustomElementDefaultStyles(menuIconElement, menuIconPositionStyles);
  globalThis.document.body.appendChild(menuIconElement);
  setTimeout(() => {
    selectedInput = inputEl;
  }, 200)
}

function setFillLogo(el: any, type = 'password', isLocked = false, isOver = false) {
  const inputEl : any = document.querySelector(`[locker-id="${el.lockerId}"]`)
  if (inputEl && getComputedStyle(inputEl).display !== 'none') {
    inputEl.addEventListener("focus", (event) => {
      initMenuIcon(inputEl, type, isLocked, isOver)
    });
  }
}

function removeFillLogo() {
  if (menuIconElement && menuIconElement.parentElement) {
    menuIconElement.parentElement.removeChild(menuIconElement);
  }
  selectedInput = null;
  menuIconElement = null;
  closeInformMenu();
}

function openInformMenu(inputEl: any, type: string = 'password') {
  if (selectedInput?.id === inputEl.id && menuElement) {
    return;
  }
  closeInformMenu();
  const { width } = inputEl.getBoundingClientRect();
  const initData = {
    type: 0,
    tab: 2,
    styles: {
      height: '300px',
      width: `${width}px`
    }
  }
  if (isSignUp && type === 'password') {
    initData.tab = 1;
    initData.styles.height = '428px'
  } else if (type === 'otp') {
    initData.type = CipherType.OTP;
    initData.tab = 2;
  }
  sendPlatformMessage({
    command: 'initInformMenu',
    data: initData
  });
  const menuElTagName = generateRandomCustomElementName();
  globalThis.customElements?.define(menuElTagName, AutofillMenuListIframe);
  menuElement = globalThis.document.createElement(menuElTagName);
  const menuPositionStyles = getMenuPosition(inputEl)
  updateCustomElementDefaultStyles(menuElement, menuPositionStyles);
  globalThis.document.body.appendChild(menuElement);
}

function closeInformMenu() {
  if (menuElement && menuElement.parentElement) {
    menuElement.parentElement.removeChild(menuElement);
  }
  menuElement = null;
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
    submitButton.removeEventListener('click', (e) => formSubmitted(e, form), false);
    submitButton.addEventListener('click', (e) => formSubmitted(e, form), false);
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

function formSubmitted(e: Event, f?: HTMLFormElement) {
  closeInformMenu();
  let form: HTMLFormElement = null;
  if (e.type === 'click') {
    form = f || (e.target as HTMLElement).closest('form');
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

function isElementVisible(el: any) {
  var theEl = el;
  el = (el = el.ownerDocument) ? el.defaultView : {};

  for (var elStyle: any; theEl && theEl !== document;) {
    elStyle = el.getComputedStyle ? el.getComputedStyle(theEl, null) : theEl.style;
    if (!elStyle) {
      return true;
    }

    if ('none' === elStyle.display || 'hidden' == elStyle.visibility) {
      return false;
    }

    // walk up
    theEl = theEl.parentNode;
  }

  return theEl === document;
}

function getSubmitButton(wrappingEl: HTMLElement, buttonNames: Set<string>) {
  if (wrappingEl == null) {
    return null;
  }
  const wrappingElIsForm = wrappingEl.tagName.toLowerCase() === 'form';
  let submitButton = wrappingEl.querySelector('input[type="submit"], input[type="image"], button[type="submit"]') as HTMLElement;
  if (submitButton == null && wrappingElIsForm) {
    const typelessButton = wrappingEl.querySelector('button:not([type])') as HTMLElement;
    if (!!typelessButton && isElementVisible(typelessButton)) {
      const buttonText = getButtonText(typelessButton);
      if (!!buttonText && buttonNames.has(buttonText.trim().toLowerCase())) {
        submitButton = typelessButton;
      }
      if (!!buttonText && cancelButtonNames.has(buttonText.trim().toLowerCase())) {
        submitButton = null;
      }
    }
  }
  if (submitButton == null) {
    const possibleSubmitButtons = Array.from(wrappingEl.querySelectorAll('button[type="button"], input[type="button"], button:not([type]), a')) as HTMLElement[];
    let typelessButton: HTMLElement = null;
    possibleSubmitButtons.forEach(button => {
      if (!!submitButton || !button || !button.tagName) {
        return;
      }
      const buttonText = getButtonText(button);
      if (!!buttonText) {
        if (
          !!typelessButton
          && button.tagName.toLowerCase() === 'button'
          && button.getAttribute('type') == null
          && !cancelButtonNames.has(buttonText.trim().toLowerCase())
          && isElementVisible(button)
        ) {
          typelessButton = button;
        } else if (buttonNames.has(buttonText.trim().toLowerCase())) {
          submitButton = button;
        }
      }
    });
    if (!submitButton && !!typelessButton) {
      submitButton = typelessButton;
    }
  }
  
  if (submitButton == null) {
    const possibleSubmitButtons = Array.from(document.querySelectorAll('button[type="button"], input[type="button"], button:not([type]), a')) as HTMLElement[];
    let typelessButton: HTMLElement = null;
    possibleSubmitButtons.forEach(button => {
      if (!!submitButton || !button || !button.tagName) {
        return;
      }
      const buttonText = getButtonText(button);
      if (!!buttonText) {
        if (
          !!typelessButton
          && button.tagName.toLowerCase() === 'button'
          && button.getAttribute('type') == null
          && !cancelButtonNames.has(buttonText.trim().toLowerCase())
          && isElementVisible(button)
        ) {
          typelessButton = button;
        } else if (buttonNames.has(buttonText.trim().toLowerCase())) {
          submitButton = button;
        }
      }
    });
    if (!submitButton && !!typelessButton) {
      submitButton = typelessButton;
    }
  }

  if (submitButton == null) {
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
  let barPage = 'bar.html';
  switch (type) {
    case 'add':
      barPage = barPage + '?id=' + '&username=' + encodeURIComponent(loginInfo.username) + '&password=' + encodeURIComponent(loginInfo.password) + '&uri=' + encodeURIComponent(loginInfo.uri) + '&domain=' + encodeURIComponent(loginInfo.domain);;
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
  iframe.className = 'cs-notification-bar-iframe';
  iframe.style.cssText = `
    height: ${type === 'add' ? '338' : '278'}px !important;
  `;
  iframe.id = '';
  iframe.src = barPageUrl;
  document.body.appendChild(iframe);

  (iframe.contentWindow.location as any) = barPageUrl;
}

function closeBar(explicitClose: boolean = false) {
  const iframeEls = document.querySelectorAll('.cs-notification-bar-iframe');
  for (let i = 0; i < iframeEls.length; i++) {
    iframeEls[i].parentElement.removeChild(iframeEls[i]);
  }

  if (explicitClose) {
    sendPlatformMessage({
      command: 'bgCloseNotificationBar',
    })
  }
}

function closePopupWindow() {
}

function openPopupWindow() {
  closePopupWindow()
}

function sendPlatformMessage(msg: any) {
  chrome.runtime.sendMessage(msg);
}

function unobserveCustomElements() {
  menuElementsMutationObserver?.disconnect();
}

function observeCustomElements() {
  if (menuElement) {
    menuElementsMutationObserver?.observe(menuElement, {
      attributes: true,
    });
  }
}

function removeModifiedElementAttributes(element: HTMLElement) {
  const attributes = Array.from(element.attributes);
  for (let attributeIndex = 0; attributeIndex < attributes.length; attributeIndex++) {
    const attribute = attributes[attributeIndex];
    if (attribute.name === "style") {
      continue;
    }

    element.removeAttribute(attribute.name);
  }
}

function  updateCustomElementDefaultStyles(element: HTMLElement, elementStyles?: any) {
  unobserveCustomElements();

  setElementStyles(element, { ...customElementDefaultStyles, ...elementStyles }, true);

  observeCustomElements();
}

function getMenuIconPosition(inputEl: HTMLElement, isOver: Boolean = false) {
  const { top, left, width, height } = inputEl.getBoundingClientRect();
  if (isOver) {
    return {
      top: `${top + (height - 20) / 2}px`,
      left: `${left + width + 20}px`,
    };
  }
  return {
    top: `${top + (height - 20) / 2}px`,
    left: `${left + width - 30}px`,
  };
}

function getMenuPosition(inputEl: HTMLElement, isOver: Boolean = false) {
  const { top, left, width, height } = inputEl.getBoundingClientRect();
  if (isOver) {
    return {
      top: `${top + height + 4}px`,
      left: `${left + width + 20}px`,
    };
  }
  return {
    top: `${top + height + 4}px`,
    left: `${left}px`,
  };
}

function handleOverlayElementMutationObserverUpdate (mutationRecord: MutationRecord[]) {
  for (let recordIndex = 0; recordIndex < mutationRecord.length; recordIndex++) {
    const record = mutationRecord[recordIndex];
    if (record.type !== "attributes") {
      continue;
    }

    const element = record.target as HTMLElement;
    if (record.attributeName !== "style") {
      removeModifiedElementAttributes(element);

      continue;
    }

    element.removeAttribute("style");
    updateCustomElementDefaultStyles(element);
  }
};

function resizeMenuInfo(msg: any) {
  const menuEls: any = document.getElementsByClassName('cs-inform-menu-iframe');
    if (menuEls && menuEls.length > 0) {
      for (let i = 0; i < menuEls.length; i += 1) {
        menuEls[i].style.setProperty('height', `${msg.data.height}px`, '');
      };
    }
}

async function checkingAutofill(msg: any) {
  watchForms(msg.data.forms);
  const autofillObj = await chrome.storage.local.get('enableAutofill');
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
}

async function processMessages(msg: any, sendResponse: Function) {
  if (msg.command === 'openNotificationBar') {
    closeExistingAndOpenBar(msg.data.type, msg.data.loginInfo);
  } else if (msg.command === 'closeNotificationBar') {
    closeBar(true);
  } else if (msg.command === 'notificationBarPageDetails') {
    await checkingAutofill(msg)
  } else if (msg.command === "closeInformMenu") {
    closeInformMenu()
  } else if (msg.command === 'openPopupWindow') {
    openPopupWindow()
  } else if (msg.command === 'closePopupWindow') {
    closePopupWindow()
  } else if (msg.command === 'resizeMenuInfo') {
    resizeMenuInfo(msg)
  }
  sendResponse();
  return true;
}

document.addEventListener('click', (event: any) => {
  if (menuElement && menuIconElement && selectedInput) {
    if (!menuElement.contains(event.target) && !menuIconElement.contains(event.target) && !selectedInput.contains(event.target)) {
      removeFillLogo();
    }
  } else if (menuIconElement && selectedInput) {
    if (!menuIconElement.contains(event.target) && !selectedInput.contains(event.target)) {
      removeFillLogo();
    }
  }
})

// Check iframes
document.addEventListener('DOMContentLoaded', event => {
  documents.push(document)
  const hideDomains = process.env.VUE_APP_HIDE_DOMAINS
  if (hideDomains && hideDomains.includes(self.location.hostname)) {
    return;
  }
});

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
