require('./bar.scss');

document.addEventListener('DOMContentLoaded', () => {
    var i18n = {};
    var lang = window.navigator.language;
    
    i18n.appName = chrome.i18n.getMessage('appName');
    i18n.close = chrome.i18n.getMessage('close');
    i18n.yes = chrome.i18n.getMessage('yes');
    i18n.never = chrome.i18n.getMessage('never');
    i18n.notificationAddSave = chrome.i18n.getMessage('notificationAddSave');
    i18n.notificationNeverSave = chrome.i18n.getMessage('notificationNeverSave');
    i18n.notificationAddDesc = chrome.i18n.getMessage('notificationAddDesc');
    i18n.notificationChangeSave = chrome.i18n.getMessage('notificationChangeSave');
    i18n.notificationChangeDesc = chrome.i18n.getMessage('notificationChangeDesc');
    lang = chrome.i18n.getUILanguage();

    // delay 50ms so that we get proper body dimensions
    setTimeout(load, 50);

    function load() {
        var body = document.querySelector('body'),
            bodyRect = body.getBoundingClientRect();

        // i18n
        body.classList.add('lang-' + lang.slice(0, 2));

        document.getElementById('logo-link').title = i18n.appName;

        if (bodyRect.width < 768) {
            document.querySelector('#template-add .add-save').textContent = i18n.yes;
            document.querySelector('#template-add .never-save').textContent = i18n.never;
            // document.querySelector('#template-add .select-folder').style.display = 'none';
            document.querySelector('#template-change .change-save').textContent = i18n.yes;
        } else {
            document.querySelector('#template-add .add-save').textContent = i18n.notificationAddSave;
            document.querySelector('#template-add .never-save').textContent = i18n.notificationNeverSave;
            document.querySelector('#template-add .select-folder').style.display = 'initial';
            document.querySelector('#template-change .change-save').textContent = i18n.notificationChangeSave;
        }
        document.querySelector('#template-add .select-folder').setAttribute('isVaultLocked', getQueryVariable('isVaultLocked') || false)
        document.querySelector('#template-add .add-text').textContent = i18n.notificationAddDesc;
        document.querySelector('#template-change .change-text').textContent = i18n.notificationChangeDesc;
        document.querySelector('#template-add .tab-uri').textContent = getQueryVariable('uri');
        document.querySelector('#template-add .info-username').value = getQueryVariable('username');
        document.querySelector("#template-add .info-password").value = getQueryVariable('password');
        document.querySelector('#template-change .tab-uri').textContent = getQueryVariable('uri');
        document.querySelector('#template-change .info-username').value = getQueryVariable('username');
        document.querySelector("#template-change .info-password").value = getQueryVariable('password');

        if (getQueryVariable('add')) {
            setContent(document.getElementById('template-add'));

            var addButton = document.querySelector('#template-add-clone .add-save'),
                neverButton = document.querySelector('#template-add-clone .never-save');
                const username = document.querySelector('#template-add-clone .info-username')
                username.addEventListener('input', (e) => {
                    e.preventDefault();
                    sendPlatformMessage({
                        command: 'barFormChange',
                        username: e.target.value,
                    });
                });
                const password = document.querySelector('#template-add-clone .info-password')
                password.addEventListener('input', (e) => {
                    e.preventDefault();
                    sendPlatformMessage({
                        command: 'barFormChange',
                        password: e.target.value,
                    });
                });
                const togglePasswordAdd = document.getElementById("toggle-password")
                togglePasswordAdd.addEventListener("click", function () {
                const type = password.getAttribute("type") === "password" ? "text" : "password"
                password.setAttribute("type", type)
            })
            addButton.addEventListener('click', (e) => {
                e.preventDefault();
                const folderId = document.querySelector('#template-add-clone .select-folder').value;
                sendPlatformMessage({
                    command: 'bgAddSave',
                    folder: folderId,
                });
            });

            neverButton.addEventListener('click', (e) => {
                e.preventDefault();
                sendPlatformMessage({
                    command: 'bgNeverSave'
                });
            });

            const responseFoldersCommand = 'notificationBarGetFoldersList';
            chrome.runtime.onMessage.addListener((msg) => {
                if (msg.command === responseFoldersCommand && msg.data) {
                    fillSelectorWithFolders(msg.data.folders);
                }
            });
            sendPlatformMessage({
                command: 'bgGetDataForTab',
                responseCommand: responseFoldersCommand
            });
        } else if (getQueryVariable('change')) {
            setContent(document.getElementById('template-change'));
            var togglePasswordAdd = document.getElementById("toggle-password")
            var username = document.querySelector('#template-change-clone .info-username')
            username.addEventListener('input', (e) => {
                e.preventDefault();
                sendPlatformMessage({
                    command: 'barFormChange',
                    username: e.target.value,
                });
            });
            var password = document.querySelector('#template-change-clone .info-password')
            password.addEventListener('input', (e) => {
                e.preventDefault();
                sendPlatformMessage({
                    command: 'barFormChange',
                    newPassword: e.target.value,
                });
            });
            togglePasswordAdd.addEventListener("click", function () {
              const type = password.getAttribute("type") === "password" ? "text" : "password"
              password.setAttribute("type", type)
            })
            var changeButton = document.querySelector('#template-change-clone .change-save');
            changeButton.addEventListener('click', (e) => {
                e.preventDefault();
                sendPlatformMessage({
                    command: 'bgChangeSave'
                });
            });
        } else if (getQueryVariable('info')) {
            setContent(document.getElementById('template-alert'));
            document.getElementById('template-alert-clone').textContent = getQueryVariable('info');
        }
        var closeButton = document.getElementById('close-button')
        closeButton.title = i18n.close;
        closeButton.setAttribute('aria-label', i18n.close);
        closeButton.addEventListener('click', (e) => {
            e.preventDefault();
            sendPlatformMessage({
                command: 'bgCloseNotificationBar'
            });
        });

        sendPlatformMessage({
            command: 'bgAdjustNotificationBar',
            data: {
                height: body.scrollHeight
            }
        });
    }

    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) { 
          var pair = vars[i].split('=');
          if (pair[0] === variable) {
            return decodeURIComponent(pair[1]);
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

    function fillSelectorWithFolders(folders) {
        const select = document.querySelector('#template-add-clone .select-folder');
        select.appendChild(new Option(chrome.i18n.getMessage('selectFolder'), null, true));
        folders.forEach((folder) => {
            select.appendChild(new Option(folder.name, folder.id || '', false));
        });
    }
});
