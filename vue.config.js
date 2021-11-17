/* eslint-disable */
var path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

const os = require('os');
module.exports = {
  pages: {
    web: {
      template: 'public/web.html',
      entry: './src/web/main.ts',
      title: 'Web'
    },
    popup: {
      template: 'public/browser-extension.html',
      entry: './src/popup/main.ts',
      title: 'Popup'
    }
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
            'notification/bar': './src/notification/bar.js',
          },
        },
      },
      manifestTransformer: (manifest) => {
        if (process.env.NODE_ENV === 'development') {
          manifest.content_security_policy = manifest.content_security_policy.replace('script-src', 'script-src http://localhost:8098');
        }

        return manifest;
      }
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        'jslib-common': path.resolve(__dirname, 'jslib/common/src'),
        'jslib/angular': path.resolve(__dirname, 'jslib/angular/src'),
      }
    },
    entry: {
      'notification/bar': './src/notification/bar.js'
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/notification/bar.html',
        filename: 'notification/bar.html',
        chunks: ['notification/bar'],
        cache: false, // Remove after upgrading to Webpack 5
      }),
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
