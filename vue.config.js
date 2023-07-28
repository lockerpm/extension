/* eslint-disable */
var path = require('path')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

const os = require('os');
module.exports = {
  pages: {
    popup: {
      template: 'public/index.html',
      entry: './src/popup/main.ts',
      title: 'Popup'
    },
    offscreen: {
      template: 'public/offscreen.html',
      entry: './src/offscreen.js',
      title: 'Offscreen'
    }
  },
  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: 'src/service-worker.ts'
        },
        contentScripts: {
          entries: {
            'content/autofill': 'src/content/autofill.js',
            'content/autofiller': 'src/content/autofiller.ts',
            'content/notificationBar': 'src/content/notificationBar.ts',
            'content/contextMenuHandler': 'src/content/contextMenuHandler.ts',
            'content/shortcuts': 'src/content/shortcuts.ts',
            'content/messageHandler': 'src/content/messageHandler.ts',
          },
        },
      },
      manifestTransformer: (manifest) => {
        if (process.env.NODE_ENV === 'development') {
          manifest.content_security_policy.extension_pages = manifest.content_security_policy.extension_pages.replace('script-src', "script-src http://localhost:8098 'wasm-unsafe-eval'");
        }
        return manifest;
      }
    }
  },
  configureWebpack: {
    devtool: 'source-map',
    resolve: {
      alias: {
        'jslib-common': path.resolve(__dirname, 'core'),
      }
    },
    plugins: [
      new MomentLocalesPlugin({
        localesToKeep: ['vi'],
      }),
    ]
  },
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(args => {
        args.compilerOptions.whitespace = 'preserve'
      })
  },
}
