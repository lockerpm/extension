import AddLoginRuntimeMessage from 'src/background/models/addLoginRuntimeMessage';
import ChangePasswordRuntimeMessage from 'src/background/models/changePasswordRuntimeMessage';
import {
    OBSERVE_IGNORED_ELEMENTS,
    CANCEL_BUTTON_NAMES,
    LOGIN_BUTTON_NAMES,
    SIGN_UP_BUTTON_NAMES,
    CHANGE_PASSWORD_BUTTON_NAMES,
    CHANGE_PASSWORD_BUTTON_CONTAINS_NAMES
} from '@/constants/index'

document.addEventListener('DOMContentLoaded', event => {
    if (window.location.hostname.indexOf('id.locker.io') > -1) {
        return;
    }

    const pageDetails: any[] = [];
    const formData: any[] = [];
    let barType: string = null;
    let pageHref: string = null;
    let observer: MutationObserver = null;
    let domObservationCollectTimeout: number = null;
    let collectIfNeededTimeout: number = null;
    let observeDomTimeout: number = null;
    let disabledAddLoginNotification = false;
    let disabledChangedPasswordNotification = false;
    let inputWithLogo: any[] = []
    let isSignUp = false
    const inIframe = !window || window.self !== window.top;
    const observeIgnoredElements = new Set(OBSERVE_IGNORED_ELEMENTS);
    const cancelButtonNames = new Set(CANCEL_BUTTON_NAMES);
    const loginButtonNames = new Set(LOGIN_BUTTON_NAMES);
    const signUpButtonNames = new Set(SIGN_UP_BUTTON_NAMES);
    const changePasswordButtonNames = new Set(CHANGE_PASSWORD_BUTTON_NAMES);
    const changePasswordButtonContainsNames = new Set(CHANGE_PASSWORD_BUTTON_CONTAINS_NAMES);

    chrome.storage.local.get('neverDomains', (ndObj: any) => {
        const domains = ndObj.neverDomains;
        if (domains != null && domains.hasOwnProperty(window.location.hostname)) {
            return;
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
    });

    chrome.runtime.onMessage.addListener((msg: any, sender: any, sendResponse: Function) => {
        processMessages(msg, sendResponse);
    });

    function processMessages(msg: any, sendResponse: Function) {
        if (msg.command === 'openNotificationBar') {
            if (inIframe) {
                return;
            }
            closeExistingAndOpenBar(msg.data.type, msg.data.typeData, msg.data.queueMessage || msg.data.loginInfo);
            sendResponse();
            return true;
        } else if (msg.command === 'closeNotificationBar') {
            if (inIframe) {
                return;
            }
            closeBar(true);
            sendResponse();
            return true;
        } else if (msg.command === 'adjustNotificationBar') {
            if (inIframe) {
                return;
            }
            adjustBar(msg.data);
            sendResponse();
            return true;
        } else if (msg.command === 'notificationBarPageDetails') {
            pageDetails.push(msg.data.details);
            watchForms(msg.data.forms);
            chrome.storage.local.get('enableAutofill', (autofillObj: any) => {
              if (autofillObj.enableAutofill === false) return;
              chrome.storage.local.get("neverDomains", (ndObj: any) => {
                const domains = ndObj.neverDomains;
                if (
                  domains == null ||
                  !domains.hasOwnProperty(window.location.hostname)
                ) {
                  for (let i = 0; i < msg.data.passwordFields.length; i++) {
                    try {
                      inputWithLogo.push(
                        setFillLogo(msg.data.passwordFields[i], "password")
                      );
                    } catch (error) {
                    }
                  }
                  for (let i = 0; i < msg.data.usernameFields.length; i++) {
                    try {
                      inputWithLogo.push(
                        setFillLogo(msg.data.usernameFields[i], "username")
                      );
                    } catch (error) {
                    }
                  }
                  inputWithLogo = inputWithLogo.filter(e => e != null)
                  document.onclick = check;
                  function check(e) {
                    const target = e && e.target;
                    let check = false;
                    for (let i = 0; i < inputWithLogo.length; i++) {
                      if (
                        checkParent(target, inputWithLogo[i].inputEl) ||
                        checkParent(target, inputWithLogo[i].logo)
                      ) {
                        check = true;
                        closeOtherMenu(i);
                      }
                    }
                    if (!check) {
                      for (let i = 0; i < inputWithLogo.length; i++) {
                        closeInformMenu(inputWithLogo[i].inputEl);
                      }
                    }
                  }
                  function closeOtherMenu(indexClick) {
                    for (let i = 0; i < inputWithLogo.length; i++) {
                      if (i !== indexClick) {
                        closeInformMenu(inputWithLogo[i].inputEl);
                      }
                    }
                  }
                  function checkParent(t, elm) {
                    while (t.parentNode) {
                      if (t === elm) {
                        return true;
                      }
                      t = t.parentNode;
                    }
                    return false;
                  }
                }
              });
            })
            sendResponse();
            return true;
        }
        else if (msg.command === 'informMenuPageDetails') {
            pageDetails.push(msg.data.details);
            watchForms(msg.data.forms);
            sendResponse();
            return true;
        }
        else if (msg.command === 'informMenuPassword') {
          useGeneratedPassword(msg.data.password)
        }
        else if (msg.command === "resizeInformMenu") {
          for (const logoField of inputWithLogo) {
            const elPosition = logoField.inputEl.getBoundingClientRect();
            const menuEl = document.getElementById(`cs-inform-menu-iframe-${logoField.inputEl.id}`);
            if (menuEl) {
              if (msg.data) {
                menuEl.style.height = msg.data.height
                menuEl.style.width = elPosition.width
              }
            }
          }
        }
        else if (msg.command === "closeInformMenu") {
          if (inIframe) {
            return;
          }
          for (const logoField of inputWithLogo) {
            closeInformMenu(logoField.inputEl);
          }
          sendResponse();
          return true;
        }
    }

    function observeDom() {
        const bodies = document.querySelectorAll('body');
        if (bodies && bodies.length > 0) {
            observer = new MutationObserver(mutations => {
                if (mutations == null || mutations.length === 0 || pageHref !== window.location.href) {
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
                            (addedNode.dataset == null || !addedNode.dataset.bitwardenWatching)) {
                            doCollect = true;
                            break;
                        }

                        if ((tagName != null && observeIgnoredElements.has(tagName)) ||
                            addedNode.querySelectorAll == null) {
                            continue;
                        }

                        const forms = addedNode.querySelectorAll('form:not([data-bitwarden-watching])');
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
                        window.clearTimeout(domObservationCollectTimeout);
                    }

                    domObservationCollectTimeout = window.setTimeout(() => {
                        sendPlatformMessage({
                            command: 'bgCollectPageDetails',
                            sender: 'notificationBar',
                        });
                    }, 1000);
                }
            });

            observer.observe(bodies[0], { childList: true, subtree: true });
        }
    }

    function collectIfNeededWithTimeout() {
        if (collectIfNeededTimeout != null) {
            window.clearTimeout(collectIfNeededTimeout);
        }
        collectIfNeededTimeout = window.setTimeout(collectIfNeeded, 1000);
    }

    function collectIfNeeded() {
        if (pageHref !== window.location.href) {
            pageHref = window.location.href;
            if (observer) {
                observer.disconnect();
                observer = null;
            }

            sendPlatformMessage({
                command: 'bgCollectPageDetails',
                sender: 'notificationBar',
            });

            if (observeDomTimeout != null) {
                window.clearTimeout(observeDomTimeout);
            }
            observeDomTimeout = window.setTimeout(observeDom, 1000);
        }

        if (collectIfNeededTimeout != null) {
            window.clearTimeout(collectIfNeededTimeout);
        }
        collectIfNeededTimeout = window.setTimeout(collectIfNeeded, 1000);
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
            if (formEl != null && formEl.dataset.bitwardenWatching !== '1') {
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
                formEl.dataset.bitwardenWatching = '1';
            }
        });
    }
    
    function useGeneratedPassword(password) {
      for (const logoField of inputWithLogo) {
        if (logoField.type === 'password') {
          logoField.inputEl.value = password;
        }
      }
      for (const logoField of inputWithLogo) {
        closeInformMenu(logoField);
      }
    }
  
    function setFillLogo(el, type='password') {
      const logo = document.createElement("span");
      logo.id = 'cs-logo-' + (el.htmlID || el.htmlName)
      let inputEl = document.getElementById(el.htmlID);
      if (!inputEl) {
        inputEl = document.getElementsByName(el.htmlName)[0]
      }
      if (inputEl && getComputedStyle(inputEl).display !== 'none') {
        inputEl.addEventListener("click", () => {
            openInformMenu(inputEl, type);
        });
        const elPosition = inputEl.getBoundingClientRect();
        let relativeContainer = inputEl.parentElement
        while (getComputedStyle(relativeContainer).position !== 'relative') {
          relativeContainer = relativeContainer.parentElement
          if (relativeContainer === null || relativeContainer.tagName.toLowerCase() === 'html') {
            break;
          }
        }
        if (relativeContainer) {
          const containerPosition = relativeContainer.getBoundingClientRect();
          logo.style.cssText = `
            position: absolute;
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAACXBIWXMAACE4AAAhOAFFljFgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAVFSURBVHgB7Zy9UiNHEMd7WpSoukhv4HV8AacnsMicHSqOD0cIuMAZ8ARA5sw4c4B1S8aHOd09wYnMGXJw8S1voHKVXXXi1OPu/RD6WH2tdpddaX9VYlntAto/3T0zPT2jIEYOa2uFf+GF0aZ2CUF/p0EZGuCVc1UbvXcrS2ndBFRNPjYI1AOiapyXL+sQIwoiRkT5h5YrSsFrrbWIUYAZUUrVtaaLPObqv5cvLYiQSATqE6UEEeKJVV2/MSECQhXIFgbyB0BwCCFYypRYgGDmAS/CtKpQBHpmYfqxhaqWr08hBGYW6G1tu0Sk3w0G2WfHQsTdWYN6YIFcqzl2rSaxIKizb/j11Cx/aEIAAgn0c23baJH+lECrGYaVR1wNEpsQpkRcqkV0nyJxBEM+8/6fm2swJVMJtF/bOiAitpxnD8RBKGgFtb3bralCQm7SG/duN49Bwy+Qfn4s/vQS7q8+301y80QxSCxHkz6DuUIdVdevxj7TWIHEb8U0YQ7hbsDquG7ASIGc1koCcipjziQ0uXUrjmrdhgZp6ec4TXnyxOEMwB0SrnovreECgsHPSJ8q/KzDblgadsHuBCa0KVeovpyvP7kGNyAlCI6xRMv8rHDkd9HXgqSvk/QecpgQ6EP7mX3wFcgZWy0W3L975+dqAwLZ/Z109ZLDwkDKD3hNj0DSarGHVyAgkrziw6n34oRZA9LFQb8V9QRpjug7fDAgIJw9vKuuX59457vvNw3VyTmngoJrRSfeG30uFtx65ogeK+oItHe7XVnQ2NMPW9FyxTvpuJhSeoc7XEnAYjf93jupcFxEoi8QIzLZwAd7nGZbkATnqGcf0oRo4bmZLVCLoAQZPXhuZrtYvO6lTP4fPXS9cQAJHO95bmYLFKd78fTxxXn5qu6dc4aPuxY6eQNingUWN8O3N/5jkAyx6hfcQKBOU0cuVlCKLLQiAzJ84Tl/AxFwBTKGgAYCJS9AJgVu3VfYxVQm0AgwG3+NxJh66nnRyAQaQybQGFCqSSFjGFZmQSNQGpqoQKctsR4fqJpIqif1kNEFz5X9jUqjBRm+KIUW5pDqkOGLLH3AR3i0+PtAFaDzjtQOLUl57P77rUZcWcV2u73GU0zG0zuUyLGgO0sMbsoVPvKhBDHAf/hA6imSjqz/kKPdDyL8akJGD4S5uhxtgcTNPJPKcNzLdMvyOjOrcbrZGIy9282nSSiK3x099xI6Qw3XzbLWzJ76flp71hHIXuxB8Btk9BSE9tQH0VLrDCkfeKaTffcHdo+TzjnASjLqISbGIkSz+42e0fysVuT2pY69F8e1tM25XZh9NdMD6Q6xogXNEVnd1XEeAwKJFfEQfxcWDJ5i9n1m34TZ+cZlnd1lYQK2PKs8s9+1oZX2Ovd4omj5dRKnhRRBobvwW5NsUhC4ObDkWYddHLmYxS1/m+vFLNxqFc0gi1kE+UH2zTLMKZxz3jXHrGMdm7R3fFMdwbxB6uiPN9cfxt020ZLM++vPfxU3Xip2yBLMB6fVN9cTLS+dalm4syBW/wpphi2nujF+KabH1Ovm3SWashoobYG7KfF0WHM+jEAbCzitW7o2FuDWatWMY2MBQf4Qp0eKaehMymckbBXNgDvCzL65yc12iTChm5vw8GFal+ontP2D9m44zYFqJwFC2RkJGXQH3dCkm1A3WLJj0zeqPJNQoQrjEdkeZrK8ylniEMcWXfBRUsZhCtP5/RAxTosHpRDFkhmYRpSidBO5QP24Qf2VU6QtNdq6oLVU2g5uE2h/BWiQpgcpJMjxXNUj/GdFLUo3/wML11LelAerTQAAAABJRU5ErkJggg==');
            height: 20px;
            min-width: 20px;
            background-position: center;
            background-size: contain;
            z-index: 1000 !important;
            background-color: #fff;
            border-radius: 50%;
            cursor: pointer;
            left: ${elPosition.left -
              containerPosition.left +
              elPosition.width -
              30}px;
            top: ${elPosition.top -
              containerPosition.top +
              (elPosition.height - 20) / 2}px`;
          inputEl.parentNode.insertBefore(logo, inputEl.nextElementSibling);
          logo.addEventListener("click", () => {
            openInformMenu(inputEl, type);
          });
          return {
            logo,
            inputEl,
            type
          };
        }
      }
      return null
    }

    function closeInformMenu(inputEl: any) {
      const menuEl = document.getElementById(`cs-inform-menu-iframe-${inputEl.id}`);
      if (menuEl) {
        menuEl.parentElement.removeChild(menuEl);
      }
    }

    function openInformMenu(inputEl: any, type: string = 'password') {
      const elPosition = inputEl.getBoundingClientRect();
      const iframeId = `cs-inform-menu-iframe-${inputEl.id}`
      if (document.body == null) {
        return;
      }
      if (document.getElementById(iframeId) != null) {
        return;
      }
      const barPageUrl: string = chrome.extension.getURL(
        "inform-menu/menu.html" + `${isSignUp && type ==='password' ? "?generate=1" : "?ciphers=1"}`
      );

      const iframe = document.createElement("iframe");
      iframe.style.cssText =
        `top: ${getOffsetTop(inputEl) + elPosition.height + 10}px;
        left: ${getOffsetLeft(inputEl)}px;
        position: absolute;
        height: 244px;
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
        border-radius: 8px;
        margin: 0px !important;
        padding: 0px !important;
      `;
      iframe.id = iframeId;
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
            if (matches.length>0) {
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

        if (form == null || form.dataset.bitwardenProcessed === '1') {
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
        form.dataset.bitwardenProcessed = '1';
        window.setTimeout(() => {
            form.dataset.bitwardenProcessed = '0';
        }, 500);
    }

    function closeExistingAndOpenBar(type: string, typeData: any, loginInfo: any) {
        let barPage = 'notification/bar.html';
        switch (type) {
            case 'add':
                barPage = barPage + '?add=1&isVaultLocked=' + typeData.isVaultLocked + '&username=' + encodeURIComponent(loginInfo.username) + '&password=' + encodeURIComponent(loginInfo.password) + '&uri=' + encodeURIComponent(loginInfo.uri);
                break;
            case 'change':
                barPage = barPage + '?change=1&isVaultLocked=' + typeData.isVaultLocked + '&username=' + encodeURIComponent(loginInfo.username) + '&password=' + encodeURIComponent(loginInfo.newPassword) + '&uri=' + encodeURIComponent(loginInfo.domain);
                break;
            default:
                break;
        }

        const frame = document.getElementById('bit-notification-bar-iframe') as HTMLIFrameElement;
        if (frame != null && frame.src.indexOf(barPage) >= 0) {
            return;
        }

        closeBar(false);
        openBar(type, barPage, loginInfo);
    }

    function openBar(type: string, barPage: string, loginInfo: object) {
        barType = type;

        if (document.body == null) {
            return;
        }

        const barPageUrl: string = chrome.extension.getURL(barPage);

        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'height: 320px; width: 450px; border: 0; min-height: initial; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 10%), 0 4px 6px -4px rgb(0 0 0 / 10%); border-radius: 12px;';
        iframe.id = 'bit-notification-bar-iframe';
        iframe.src = barPageUrl;

        const frameDiv = document.createElement('div');
        frameDiv.setAttribute('aria-live', 'polite');
        frameDiv.id = 'bit-notification-bar';
        frameDiv.style.cssText = 'height: 325px; width: 450px; top: 40px; right: 40px; padding: 0; position: fixed; ' +
            'z-index: 2147483647; visibility: visible;';
        frameDiv.appendChild(iframe);
        document.body.appendChild(frameDiv);

        (iframe.contentWindow.location as any) = barPageUrl;
    }

    function closeBar(explicitClose: boolean) {
        const barEl = document.getElementById('bit-notification-bar');
        if (barEl != null) {
            barEl.parentElement.removeChild(barEl);
        }

        const spacerEl = document.getElementById('bit-notification-bar-spacer');
        if (spacerEl) {
            spacerEl.parentElement.removeChild(spacerEl);
        }

        if (!explicitClose) {
            return;
        }

        switch (barType) {
            case 'add':
                sendPlatformMessage({
                    command: 'bgAddClose',
                });
                break;
            case 'change':
                sendPlatformMessage({
                    command: 'bgChangeClose',
                });
                break;
            default:
                break;
        }
    }

    function adjustBar(data: any) {
        if (data != null && data.height !== 42) {
            const newHeight = data.height + 'px';
            doHeightAdjustment('bit-notification-bar-iframe', newHeight);
            doHeightAdjustment('bit-notification-bar', newHeight);
            doHeightAdjustment('bit-notification-bar-spacer', newHeight);
        }
    }

    function doHeightAdjustment(elId: string, heightStyle: string) {
        const el = document.getElementById(elId);
        if (el != null) {
            el.style.height = heightStyle;
        }
    }

    function sendPlatformMessage(msg: any) {
        chrome.runtime.sendMessage(msg);
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
});
