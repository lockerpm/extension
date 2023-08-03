![Locker Password Manager](https://raw.githubusercontent.com/lockerpm/.github/main/images/extension-locker.png)

# Locker Extension

Locker Extension is a cross-platform browser extension that integrates with popular browsers, including Chrome, Firefox, Edge, and Safari. The extension enhances the browsing experience by allowing users to securely store and manage their passwords and secrets directly from the browser.

## Getting Started

### Requirements
- [NodeJS](https://nodejs.org/) v16 - 16.20.0 (preferably using a [node version manager](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm))
- [NPM](https://www.npmjs.com/) v8 - 8.19.4 (included with Node)


### Environment Setup

By default, the browser extension will call the production server endpoints. To override this for local development and testing, please modify the `.env.production.local` as below:


```
VUE_APP_ENVIRONMENT=production
VUE_APP_ID_URL=https://id.locker.io
VUE_APP_BASE_API_URL=https://api.locker.io/v3
VUE_APP_WS_URL=wss://api.locker.io/ws
VUE_APP_LOGO_URL=https://locker.io/logo/
VUE_APP_DESKTOP_WS_URL=ws://localhost:1040
```

### Build


```shell
# Clone the repository
git clone https://github.com/lockerpm/extension.git

# Install the dependencies
npm install

# Build and run the extension
npm run build
```



## Testing and Debugging

### Chrome and Chromium-based browsers

To load the browser extension built:

1. Navigate to `chrome://extensions` in your address bar. This will open the extensions page
2. Enable `developer mode` (toggle switch)
3. Click the `Load unpacked` button
4. Open the `dist` folder of your local repository and confirm your choice

To debug the background page of the browser extension, follow these steps:

- Open the Chrome browser and navigate to `chrome://extensions`.
- Look for the `Locker` heading in the extensions list and find the `background.html` link underneath it.
- Click on the `background.html` link to open the background page in the developer tools.

To debug the popup of the browser extension, do the following:

- Ensure the popup is open by clicking on the Locker extension icon in the Chrome toolbar.
- Right-click anywhere within the popup window.
- From the context menu that appears, select `Inspect` to open the popup in the developer tools for debugging.



### Firefox

To load the browser extension built:

1. Navigate to `about:debugging` in your address bar. This will open the add-on debugging page
2. Click `This Firefox`
3. Click `Load Temporary Add-on`
4. Open the `dist` folder of your local repository and open the `manifest.json` file


The temporary add-on will remain installed only for the current browsing session. If you close and then reopen Firefox, you'll need to load the temporary add-on again to use it.

## Contributing
Contributions to the Locker Extension project are welcome! If you find any issues or want to suggest improvements, please feel free to open an issue or submit a pull request.

Before contributing, please review the [Contribution Guidelines](https://github.com/lockerpm/.github/blob/main/CONTRIBUTING.md).

## License
The Locker Extension is open-source and released under the [GPLv3](./LICENSE) License. Feel free to use, modify, and distribute the code as per the terms of the license.
