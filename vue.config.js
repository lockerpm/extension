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
  },
  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: 'src/background.ts'
        },
        contentScripts: {
          entries: {
            'content/autofill': 'src/content/autofill.js',
            'content/autofiller': 'src/content/autofiller.ts',
            'content/notificationBar': 'src/content/notificationBar.ts',
            'content/contextMenuHandler': 'src/content/contextMenuHandler.ts',
            'content/shortcuts': 'src/content/shortcuts.ts',
            'content/message_handler': 'src/content/message_handler.ts',
          },
        },
      },
      manifestTransformer: (manifest) => {
        if (process.env.NODE_ENV === 'development') {
          manifest.content_security_policy = manifest.content_security_policy.replace('script-src', `script-src http://localhost:8098 'unsafe-eval'`);
        }
        return manifest;
      }
    }
  },
  configureWebpack: {
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
