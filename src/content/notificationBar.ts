import AddLoginRuntimeMessage from 'src/background/models/addLoginRuntimeMessage';
import ChangePasswordRuntimeMessage from 'src/background/models/changePasswordRuntimeMessage';

document.addEventListener('DOMContentLoaded', event => {
    if (window.location.hostname.indexOf('id.locker.io') > -1) {
        return;
    }

    const pageDetails: any[] = [];
    const formData: any[] = [];
    let barType: string = null;
    let pageHref: string = null;
    let observer: MutationObserver = null;
    const observeIgnoredElements = new Set(['a', 'i', 'b', 'strong', 'span', 'code', 'br', 'img', 'small', 'em', 'hr']);
    let domObservationCollectTimeout: number = null;
    let collectIfNeededTimeout: number = null;
    let observeDomTimeout: number = null;
    const inIframe = isInIframe();
    const cancelButtonNames = new Set(['cancel', 'close', 'back']);
    const logInButtonNames = new Set(['log in', 'sign in', 'login', 'go', 'submit', 'continue', 'next', 'sign up', 'create', 'register', 'đăng nhập']);
    const signUpButtonNames = new Set(['sign up', 'create', 'register', 'đăng ký', 'tạo tài khoản']);
    const changePasswordButtonNames = new Set(['save password', 'update password', 'change password', 'change']);
    const changePasswordButtonContainsNames = new Set(['pass', 'change', 'contras', 'senha']);
    let disabledAddLoginNotification = false;
    let disabledChangedPasswordNotification = false;
    let inputWithLogo: any[] = []
    let isSignUp = false
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
                        const elPosition = inputWithLogo[
                          i
                        ].inputEl.getBoundingClientRect();
                        const elOffset = {
                          left: getOffsetLeft(inputWithLogo[i].inputEl),
                          top: getOffsetTop(inputWithLogo[i].inputEl)
                        };
                        closeInformMenu(false, elPosition, elOffset);
                      }
                    }
                  }
                  function closeOtherMenu(indexClick) {
                    for (let i = 0; i < inputWithLogo.length; i++) {
                      if (i !== indexClick) {
                        const elPosition = inputWithLogo[
                          i
                        ].inputEl.getBoundingClientRect();
                        const elOffset = {
                          left: getOffsetLeft(inputWithLogo[i].inputEl),
                          top: getOffsetTop(inputWithLogo[i].inputEl)
                        };
                        closeInformMenu(false, elPosition, elOffset);
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
          // console.log(msg.data.password)
          // console.log(passwordFields)
        }
        else if (msg.command === "resizeInformMenu") {
          resizeInformMenu(msg.data)
        }
        else if (msg.command === "closeInformMenu") {
          if (inIframe) {
            return;
          }
          for (const logoField of inputWithLogo) {
            const elPosition = logoField.inputEl.getBoundingClientRect();
            const elOffset = {
              left: getOffsetLeft(logoField.inputEl),
              top: getOffsetTop(logoField.inputEl)
            };
            closeInformMenu(false, elPosition, elOffset);
          }
          sendResponse();
          return true;
        }
    }

    function isInIframe() {
        try {
            return window.self !== window.top;
        } catch {
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

                    domObservationCollectTimeout = window.setTimeout(collect, 1000);
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

            collect();

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

    function collect() {
        sendPlatformMessage({
            command: 'bgCollectPageDetails',
            sender: 'notificationBar',
        });
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
        const elPosition = logoField.inputEl.getBoundingClientRect();
        const elOffset = {
          left: getOffsetLeft(logoField.inputEl),
          top: getOffsetTop(logoField.inputEl)
        };
        closeInformMenu(false, elPosition, elOffset);
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
          logo.style.cssText = `background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJCSURBVHgBpVVNTxNRFD1vOqXO2JahRSnCooXITu1Od+rWDfwBk7LTlfgT3LFDf4Ekrk3UhdGVYae7YmIwftAxWO0ES0epLUKZ57tPpsy8Dq2Ek7R5c999592Pc2cYIpDP5632H60EsKsAL3JhIjsDbPFf9jQ83ax+Xo46y1TDmYnpEuN8CRwW+sPmGrunEsdCZONTS4xjUSxPYTAs4TuXTI1Yv5uNlz2EkgxYiDppZhOImzr22vtR21eCpDJlmabHH9J6eNJE4foY0hMGzEwCuhlKAp3WPn5WW2hv7aK22kDtrSvtIv15Sl8Snh2fquCg8MWbBUxezvaQUHRGdihk//qmjvKjiv/omgmvoFF0PpmPdn1X/nxQRPVP2xgAqQxdFHZW3fEPG1tDcERKYxcHNdwHv6aD8+JR2xuvf4Axhv8FB7ukQUn3hMhr/XZHZ9I4LnTIcTqMcq/VQVpIh5A9n0LugiWbEgXyVWDrokhlUccuIemKdNi9UeiQ9Bg3Yj2EvgZ9MPBVTcztStBY/7iNyisn5Ej686P2QT7kGyLk2pNYfHT4fcxjtxCY3821XzKikUISUSCyd483lOhgO7X1+diO6+6kTmcczjAXdCDSjpgOItXi/3pHE7P2rIoPz7/1XKJxdrfZbJS7IhMvh/vi4Y7qSC+GmRvn5OgRUUQjKLoHzvf1hYP1IY4i7YcgGSHUulaz8SKVzHwRXjQ91gAmV6R5W9RtUbkgGrncdMljmGXKJ0CMl6gTXzES3rJt26567i/C7OMyDBzr7gAAAABJRU5ErkJggg==');
              height: 20px;
              min-width: 20px;
              position: absolute;
              z-index: 1;
              left: ${elPosition.left - containerPosition.left +  elPosition.width - 30}px;
              top: ${elPosition.top - containerPosition.top + (elPosition.height - 20) / 2}px`;

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

        // if (containerStyle.position === 'relative') {
        //   logo.style.cssText = `background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJCSURBVHgBpVVNTxNRFD1vOqXO2JahRSnCooXITu1Od+rWDfwBk7LTlfgT3LFDf4Ekrk3UhdGVYae7YmIwftAxWO0ES0epLUKZ57tPpsy8Dq2Ek7R5c999592Pc2cYIpDP5632H60EsKsAL3JhIjsDbPFf9jQ83ax+Xo46y1TDmYnpEuN8CRwW+sPmGrunEsdCZONTS4xjUSxPYTAs4TuXTI1Yv5uNlz2EkgxYiDppZhOImzr22vtR21eCpDJlmabHH9J6eNJE4foY0hMGzEwCuhlKAp3WPn5WW2hv7aK22kDtrSvtIv15Sl8Snh2fquCg8MWbBUxezvaQUHRGdihk//qmjvKjiv/omgmvoFF0PpmPdn1X/nxQRPVP2xgAqQxdFHZW3fEPG1tDcERKYxcHNdwHv6aD8+JR2xuvf4Axhv8FB7ukQUn3hMhr/XZHZ9I4LnTIcTqMcq/VQVpIh5A9n0LugiWbEgXyVWDrokhlUccuIemKdNi9UeiQ9Bg3Yj2EvgZ9MPBVTcztStBY/7iNyisn5Ej686P2QT7kGyLk2pNYfHT4fcxjtxCY3821XzKikUISUSCyd483lOhgO7X1+diO6+6kTmcczjAXdCDSjpgOItXi/3pHE7P2rIoPz7/1XKJxdrfZbJS7IhMvh/vi4Y7qSC+GmRvn5OgRUUQjKLoHzvf1hYP1IY4i7YcgGSHUulaz8SKVzHwRXjQ91gAmV6R5W9RtUbkgGrncdMljmGXKJ0CMl6gTXzES3rJt26567i/C7OMyDBzr7gAAAABJRU5ErkJggg==');
        //         height: 20px;
        //         min-width: 20px;
        //         position: absolute;
        //         left: ${elPosition.width - 30}px;
        //         top: ${(elPosition.height - 20) / 2}px`;
        // } else {
        //     logo.style.cssText = `background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJCSURBVHgBpVVNTxNRFD1vOqXO2JahRSnCooXITu1Od+rWDfwBk7LTlfgT3LFDf4Ekrk3UhdGVYae7YmIwftAxWO0ES0epLUKZ57tPpsy8Dq2Ek7R5c999592Pc2cYIpDP5632H60EsKsAL3JhIjsDbPFf9jQ83ax+Xo46y1TDmYnpEuN8CRwW+sPmGrunEsdCZONTS4xjUSxPYTAs4TuXTI1Yv5uNlz2EkgxYiDppZhOImzr22vtR21eCpDJlmabHH9J6eNJE4foY0hMGzEwCuhlKAp3WPn5WW2hv7aK22kDtrSvtIv15Sl8Snh2fquCg8MWbBUxezvaQUHRGdihk//qmjvKjiv/omgmvoFF0PpmPdn1X/nxQRPVP2xgAqQxdFHZW3fEPG1tDcERKYxcHNdwHv6aD8+JR2xuvf4Axhv8FB7ukQUn3hMhr/XZHZ9I4LnTIcTqMcq/VQVpIh5A9n0LugiWbEgXyVWDrokhlUccuIemKdNi9UeiQ9Bg3Yj2EvgZ9MPBVTcztStBY/7iNyisn5Ej686P2QT7kGyLk2pNYfHT4fcxjtxCY3821XzKikUISUSCyd483lOhgO7X1+diO6+6kTmcczjAXdCDSjpgOItXi/3pHE7P2rIoPz7/1XKJxdrfZbJS7IhMvh/vi4Y7qSC+GmRvn5OgRUUQjKLoHzvf1hYP1IY4i7YcgGSHUulaz8SKVzHwRXjQ91gAmV6R5W9RtUbkgGrncdMljmGXKJ0CMl6gTXzES3rJt26567i/C7OMyDBzr7gAAAABJRU5ErkJggg==');
        //         height: 20px;
        //         min-width: 20px;
        //         position: absolute;
        //         top: ${elPosition.top + (elPosition.height - 20) / 2}px;
        //         left: ${elPosition.left + elPosition.width - 25}px;`;
        // }
      }
      return null
    }
    function resizeInformMenu(sizeData: any) {
      for (const logoField of inputWithLogo) {
        const elPosition = logoField.inputEl.getBoundingClientRect();
        const elOffset = {
          left: getOffsetLeft(logoField.inputEl),
          top: getOffsetTop(logoField.inputEl)
        };
        const menuEl = document.getElementById("cs-inform-menu-iframe-" + Math.round(elOffset.top) + '' + Math.round(elOffset.left));
        if (menuEl) {
          if (sizeData) {
            menuEl.style.height = sizeData.height
            menuEl.style.width = sizeData.width
          }
          // menuEl.style.height = '407px'
        }
      }
    }
    function closeInformMenu(explicitClose: boolean, elPosition: any, elOffset: any) {
      const menuEl = document.getElementById("cs-inform-menu-iframe-" + Math.round(elOffset.top) + '' + Math.round(elOffset.left));
      if (menuEl != null) {
        menuEl.parentElement.removeChild(menuEl);
      }


      if (!explicitClose) {
        return;
      }
    }
    function openInformMenu(inputEl: any, type: string = 'password') {
      const elPosition = inputEl.getBoundingClientRect();
      const elOffset = {
        left: getOffsetLeft(inputEl),
        top: getOffsetTop(inputEl)
      }
      if (document.body == null) {
        return;
      }
      if (document.getElementById("cs-inform-menu-iframe-" + Math.round(elOffset.top) + '' + Math.round(elOffset.left)) != null) {
        // closeInformMenu(false, elPosition)
        return;
      }
      const barPageUrl: string = chrome.extension.getURL(
        "inform-menu/menu.html" + `${isSignUp && type ==='password' ? "?generate=1" : "?ciphers=1"}`
      );

      const iframe = document.createElement("iframe");
      iframe.style.cssText =
        `top: ${elOffset.top + elPosition.height + 10}px; left: ${elOffset.left}px;
        position: absolute;
        height: 244px; 
        width: 320px;
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
      iframe.id = "cs-inform-menu-iframe-" + Math.round(elOffset.top) + '' + Math.round(elOffset.left);

      iframe.src = barPageUrl;
      // const frameDiv = document.createElement("div");
      // frameDiv.setAttribute("aria-live", "polite");
      // frameDiv.id = "cs-inform-menu-bar";
      // frameDiv.style.cssText =
      //   `top: ${elPosition.top + elPosition.height + 10}px; left: ${elPosition.left}px;
      //   height: 200px; width: 320px; padding: 0; position: fixed;
      //   z-index: 2147483647; visibility: visible;`
      // frameDiv.appendChild(iframe);
      document.body.appendChild(iframe);
      (iframe.contentWindow.location as any) = barPageUrl;
      // const spacer = document.createElement("div");
      // spacer.id = "inform-menu-spacer";
      // spacer.style.cssText = "height: 42px;";
      // document.body.insertBefore(spacer, document.body.firstChild);
    }
  
    function listen(form: HTMLFormElement) {
        form.removeEventListener('submit', formSubmitted, false);
        form.addEventListener('submit', formSubmitted, false);
        const submitButton = getSubmitButton(form, logInButtonNames);
        if (submitButton != null) {
            const buttonText = getButtonText(submitButton);
            const matches = Array.from(signUpButtonNames)
              .filter(n => buttonText.toLowerCase().indexOf(n) > -1);
            if (matches.length>0) {
              isSignUp = true;
            }
            // console.log(isSignUp)
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
        // console.log(wrappingEl)
        const wrappingElIsForm = wrappingEl.tagName.toLowerCase() === 'form';
        // console.log(wrappingElIsForm)
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
                barPage = barPage + '?change=1&isVaultLocked=' + typeData.isVaultLocked + '&username=' + encodeURIComponent(loginInfo.username) + '&password=' + encodeURIComponent(loginInfo.password) + '&uri=' + encodeURIComponent(loginInfo.uri);
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

        // const spacer = document.createElement('div');
        // spacer.id = 'bit-notification-bar-spacer';
        // spacer.style.cssText = 'height: 42px;';
        // document.body.insertBefore(spacer, document.body.firstChild);
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
