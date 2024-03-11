// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import Vue from 'vue'

import AsyncComputed from 'vue-async-computed'
import Clipboard from 'vue-clipboard2'
import Element from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'

import App from '@/menu/App.vue'
import router from '@/router/menu'
import store from '@/store/menu'

import i18n from '@/locales/i18n'

import JSLib from '@/services'
import { CipherType } from "jslib-common/enums/cipherType";
import { WALLET_APP_LIST } from "@/utils/crypto/applist/index";
import { BrowserApi } from "@/browser/browserApi";

Vue.config.productionTip = false;

Vue.use(AsyncComputed)
Vue.use(JSLib)
Vue.use(Clipboard)
Vue.use(Element, { locale })

import { Avatar } from "element-ui";
import extractDomain from "extract-domain";

import '@fortawesome/fontawesome-free/css/all.min.css';
import '@/assets/css/index.scss'
import '@/assets/css/menu.scss'

Vue.mixin({
  data() {
    return {
      pageSize: 150,
    };
  },
  asyncComputed: {
    isLoggedIn: {
      async get() {
        const userPw = await this.$storageService.get('cs_user_pw')
        return !!userPw && userPw.email
      },
      watch: [
      ],
    }
  },
  computed: {
    searchText() { return this.$store.state.searchText },
  },
  methods: {
    notify(message, type, html = false, duration = 8000) {
      this.$notify({
        title: String(this.$t(`common.${type}`)),
        message,
        type,
        duration,
        dangerouslyUseHTMLString: html
      })
    },
    getIconCipher(cipher, size = 70, defaultIcon = false) {
      switch (cipher.type) {
      case CipherType.Login:
        if (
          cipher.login &&
            cipher.login.uris &&
            cipher.login.uris.length &&
            !this.hideIcons
        ) {
          try {
            const domain = extractDomain(
              cipher.login.uris[0]._uri || cipher.login.uris[0].uri
            );
            if (domain) {
              return this.$createElement(
                Avatar,
                {
                  props: {
                    src: `${process.env.VUE_APP_LOGO_URL}${domain}?size=${size}`,
                    size,
                    alt: domain,
                    shape: "square"
                  }
                },
                [
                  this.$createElement("img", {
                    attrs: {
                      src: require("@/assets/images/icons/icon_Login.svg")
                    }
                  })
                ]
              );
            }
          } catch (e) {
            return this.getIconDefaultCipher("Login", size);
          }
        }
        return this.getIconDefaultCipher("Login", size);
      case CipherType.SecureNote:
        return this.getIconDefaultCipher("SecureNote", size);
      case CipherType.Card:
        return this.getIconDefaultCipher("Card", size);
      case CipherType.Identity:
        return this.getIconDefaultCipher("Identity", size);
      case 6:
        return this.getIconDefaultCipher("CryptoAccount", size);
      case 7:
        if (!defaultIcon) {
          if (cipher.cryptoWallet && cipher.cryptoWallet.walletApp) {
            try {
              const selectedApp = WALLET_APP_LIST.find(
                a => a.alias === cipher.cryptoWallet.walletApp.alias
              );
              return this.$createElement(
                Avatar,
                {
                  props: {
                    src: selectedApp.logo,
                    size,
                    alt: selectedApp.name,
                    shape: "square"
                  }
                },
                [
                  this.$createElement("img", {
                    attrs: {
                      src: require("@/assets/images/icons/icon_CryptoWallet.svg")
                    }
                  })
                ]
              );
            } catch (e) {
              return this.getIconDefaultCipher("CryptoWallet", size);
            }
          }
        }
        return this.getIconDefaultCipher("CryptoWallet", size);
      case "Shares":
        return this.getIconDefaultCipher("Shares", size);
      case "Trash":
        return this.getIconDefaultCipher("Trash", size);
      case "Vault":
        return this.getIconDefaultCipher("Dashboard", size);
      default:
        return "";
      }
    },
    getIconDefaultCipher(type, size = 70) {
      return this.$createElement('img', {
        attrs: {
          src: require(`@/assets/images/icons/icon_${type}.svg`),
          style: `height: ${size}px`,
          class: 'rounded mx-auto'
        }
      })
    },
    async fillCipher(cipher, enableUpdate = false) {
      const tab = await BrowserApi.getTabFromCurrentWindow();
      if (tab) {
        if (cipher.id && enableUpdate) {
          await BrowserApi.tabSendMessageData(tab, 'useCipher', {
            cipherId: cipher.id,
            payload: { use: true, favorite: cipher.favorite }
          });
        }
        await BrowserApi.tabSendMessage(tab, {
          command: 'collectPageDetails',
          tab: tab,
          sender: 'autofillItem',
          cipher: cipher,
        });
      }
      this.closeMenu()
    },
    async addExcludeDomain(domain: string) {
      const tab = await BrowserApi.getTabFromCurrentWindow();
      if (tab) {
        await BrowserApi.tabSendMessageData(tab, 'addExcludeDomain', {
          domain: domain,
        });
      }
      this.closeMenu();
    },
    async removeExcludeDomain(domain: any) {
      const tab = await BrowserApi.getTabFromCurrentWindow();
      if (tab) {
        await BrowserApi.tabSendMessageData(tab, 'removeExcludeDomain', {
          excludeId: domain.id,
        });
      }
      this.closeMenu();
    },
    async closeMenu() {
      setTimeout(async () => {
        const tab = await BrowserApi.getTabFromCurrentWindow();
        if (tab) {
          await BrowserApi.tabSendMessageData(tab, 'closeInformMenu')
        }
      }, 200);
    },
  }
})

Vue.filter('filterString', function (value) {
  return value
})

store.commit('SET_LANG', store.state.language)
i18n.locale = store.state.language
new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#menu-app')
