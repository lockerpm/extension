// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import Vue from 'vue'

import AsyncComputed from 'vue-async-computed'
import Clipboard from 'vue-clipboard2'
import Element from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'
import moment from "moment";
import VueMomentJS from "vue-momentjs";
import VueNativeSock from "vue-native-websocket";

import App from '@/popup/App.vue'
import router from '@/router/popup'
import storePromise from '@/store'

import i18n from '@/locales/i18n'
import JSLib from '@/popup/services/services'
import { CipherType } from "jslib-common/enums/cipherType";
import { WALLET_APP_LIST } from "@/utils/crypto/applist/index";
import { BrowserApi } from "@/browser/browserApi";
import { CipherView } from "jslib-common/models/view/cipherView";
import { SecureNote } from 'jslib-common/models/domain/secureNote';
import { CipherRequest } from 'jslib-common/models/request/cipherRequest';

import cystackPlatformAPI from '@/api/cystack_platform'
import userAPI from '@/api/user';
import commonAPI from '@/api/common'


Vue.config.productionTip = false;

Vue.use(AsyncComputed)
Vue.use(JSLib)
Vue.use(Clipboard)
Vue.use(Element, { locale })
Vue.use(VueMomentJS, moment);
Vue.use(VueNativeSock, "ws://192.168.0.186:8000", {
  connectManually: true
});

import '@fortawesome/fontawesome-free/css/all.min.css'
import '@/assets/buildtw.css'
import '@/assets/tailwind.css'
import '@/assets/app.scss'
import '@/assets/flags/flags.css'
import find from "lodash/find";
import { nanoid } from 'nanoid'
import { Avatar } from "element-ui";
import extractDomain from "extract-domain";

import middleware from '../middleware';
import { service } from './service'

self.service = service

Vue.mixin({
  data() {
    return {
      totpCode: "",
      totpTimeout: null,
      loadedTimeout: null,
      pageDetails: null,
      selectedCipher: null,
      pageSize: 150,

      folders: [],
      strategies: [
        { key: "google", name: "Google", color: "#4284f4" },
        { key: "facebook", name: "Facebook", color: "#3c65c4" },
        { key: "github", name: "GitHub", color: "#202326" },
        { key: "sso", name: "Enterprise Single Sign-On", color: "#268334" },
      ]
    };
  },
  computed: {
    loginInfo() {
      return {
        login_step: this.$store.state.login_step,
        identity: this.$store.state.identity,
        auth_info: this.$store.state.auth_info,
        clientId: this.$store.state.clientId,
        sending: this.$store.state.sending,
        forgot_step: this.$store.state.forgot_step,
        forgot_token: this.$store.state.forgot_token
      }
    },
    language() { return this.$store.state.userPw?.language },
    currentUser() { return this.$store.state.userPw || {} },
    environment() { return this.$store.state.environment },
    isLoggedIn() { return this.$store.state.isLoggedIn },
    isAllPage() { return this.$route.name === 'vault' },
    searchText() { return this.$store.state.searchText },
    teams() { return this.$store.state.teams || [] },
    currentOrg() { return find(this.teams, team => team.id === this.$route.params.teamId) || {} },
    currentPlan() { return this.$store.state.currentPlan },
    hideIcons() {
      return this.$store.state.hideIcons
    },
    showFolders() {
      return this.$store.state.showFolders
    },
    enableAutofill() {
      return this.$store.state.enableAutofill
    },
  },
  destroyed() {
    self.clearTimeout(this.loadedTimeout);
  },
  methods: {
    changeLang(value) {
      if (value === 'vi') {
        this.$moment.locale('vi', {
          months: 'tháng 1_tháng 2_tháng 3_tháng 4_tháng 5_tháng 6_tháng 7_tháng 8_tháng 9_tháng 10_tháng 11_tháng 12'.split('_'),
          monthsShort: 'Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12'.split('_'),
          relativeTime: {
            future: '%s tới',
            past: '%s trước',
            s: 'Vài giây',
            m: '1 phút',
            mm: '%d phút',
            h: '1 giờ',
            hh: '%d giờ',
            d: '1 ngày',
            dd: '%d ngày',
            M: '1 tháng',
            MM: '%d tháng',
            y: '1 năm',
            yy: '%d năm'
          },
          longDateFormat: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM [năm] YYYY',
            LLL: 'D MMMM [năm] YYYY HH:mm',
            LLLL: 'dddd, D MMMM [năm] YYYY HH:mm',
            l: 'DD/M/YYYY',
            ll: 'D MMM YYYY',
            lll: 'D MMM YYYY HH:mm',
            llll: 'ddd, D MMM YYYY HH:mm'
          },
          week: {
            dow: 1
          }
        })
      } else {
        this.$moment.locale('en')
      }
      this.$store.dispatch('SetLang', value).then(() => {
        this.$i18n.locale = value
        this.$runtimeBackground.updateStoreService('language', value)
      })
    },
    async logout() {
      this.$store.commit('UPDATE_LOGIN_PAGE_INFO', null)
      try {
        await userAPI.logout();
        if (this.currentUser?.sync_all_platforms) {
          await commonAPI.service_logout();
        }
      } catch (error) {
        //
      }
      await self.lockerMain.onLogout(false)
      this.$store.commit('CLEAR_ALL_DATA')
      await this.setupFillPage();
      this.$router.push({ name: 'login' }).catch(() => ({}));
    },
    async lock() {
      await self.lockerMain.onLock()
      await this.setupFillPage();
      this.$router.push({ name: 'lock' }).catch(() => ({}));
    },
    randomString() {
      return nanoid()
    },
    notify(message, type, html = false, duration = 8000) {
      this.$notify({
        title: String(this.$t(`common.${type}`)),
        message,
        type,
        duration,
        dangerouslyUseHTMLString: html
      })
    },
    async genKey(masterPassword, email) {
      try {
        const key = await this.$cryptoService.makeKey(masterPassword, email, 0, 100000)
        const hashedPassword = await this.$cryptoService.hashPassword(masterPassword, key)
        return hashedPassword
      } catch (e) {
        return ''
      }
    },
    async getSyncData(trigger = false) {
      this.$store.commit('UPDATE_SYNCING', true);
      await this.$store.dispatch('LoadCurrentUserPw')
      await this.$syncService.syncData(trigger);
      this.$store.commit("UPDATE_SYNCED_CIPHERS");
      this.$store.commit('UPDATE_SYNCING', false);
    },
    async getFolders() {
      return await this.$folderService.getAllDecrypted()
    },
    async getExcludeDomains() {
      await cystackPlatformAPI.exclude_domains().then(response => {
        this.$cipherService.saveNeverDomains(response.results)
        this.$store.commit("UPDATE_EXCLUDE_DOMAINS");
      }).catch(() => {
        this.$cipherService.saveNeverDomains([])
        this.$store.commit("UPDATE_EXCLUDE_DOMAINS");
      })
    },
    clipboardSuccessHandler() {
      this.notify(this.$t('common.copied'), 'success')
    },
    getIconCipher(cipher, size = 70) {
      switch (cipher.type) {
      case CipherType.Login:
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
    getTeam(teams, orgId) {
      return find(teams, e => e.id === orgId) || {}
    },
    canManageItem(teams, item) {
      const team = this.getTeam(teams, item.organizationId)
      if (team.id) {
        return [0, 1].includes(team.type);
      }
      return true
    },
    canManageFolder(teams, item) {
      const team = this.getTeam(teams, item.organizationId)
      if (team.organization_id) {
        return ['owner', 'admin'].includes(team.role)
      }
      return true
    },
    openNewTab(link) {
      if (!link.match(/^https?:\/\//i)) {
        link = "http://" + link;
      }
      self.open(link, '_blank')
    },
    sanitizeUrl(connectionUrl) {
      if (connectionUrl.startsWith('//')) {
        const scheme = self.location.protocol === 'https:' ? 'wss' : 'ws'
        connectionUrl = `${scheme}:${connectionUrl}`
      }

      return connectionUrl
    },
    generateOTP() {
      const digits = '0123456789';
      let OTP = '';
      for (let i = 0; i < 6; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
      }
      return OTP;
    },
    async deleteCiphers (ids, callback = () => ({})) {
      this.$confirm(this.$tc('data.notifications.delete_selected_desc', ids.length), this.$t('common.warning'), {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(async () => {
        try {
          await cystackPlatformAPI.ciphers_permanent_delete({ ids })
          this.notify(this.$tc('data.notifications.delete_success', ids.length, { type: this.$tc('type.0', ids.length) }), 'success')
          callback()
        } catch (e) {
          this.notify(this.$tc('data.notifications.delete_failed', ids.length, { type: this.$tc('type.0', ids.length) }), 'warning')
        }
      })
    },
    async deleteFolder (id, callback = () => ({})) {
      this.$confirm(this.$tc('data.notifications.delete_selected_desc', 1), this.$t('common.warning'), {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(async () => {
        try {
          await cystackPlatformAPI.delete_folder(id)
          this.notify(this.$tc('data.notifications.delete_success', 1, { type: this.$t('common.folder') }), 'success')
          callback()
        } catch (e) {
          this.notify(this.$tc('data.notifications.delete_failed', 1, { type: this.$t('common.folder')  }), 'warning')
        }
      })
    },
    async fillCipher(cipher, enableUpdate = false) {
      if (cipher.id && enableUpdate) {
        await cystackPlatformAPI.use_cipher(
          cipher.id,
          { use: true, favorite: cipher.favorite },
        )
      }
      const tab = await BrowserApi.getTabFromCurrentWindow();
      BrowserApi.tabSendMessage(tab, {
        command: 'collectPageDetails',
        tab: tab,
        sender: 'autofillItem',
        cipher: cipher
      });
      this.closeMenu()
    },
    async addExcludeDomain(url: string, callback = () => ({}), isNotification = true) {
      try {
        await cystackPlatformAPI.add_exclude_domain({ domain: url })
        await this.getExcludeDomains();
        callback()
        if (isNotification) {
          this.notify(this.$tc('data.notifications.added_excluded_domain'), 'success')
        }
      } catch (e) {
        if (isNotification) {
          this.notify(this.$tc('data.notifications.cannot_add_excluded_domain'), 'error')
        }
      }
    },
    async removeDomain(domain: any, isNotification = true) {
      cystackPlatformAPI.delete_exclude_domain(domain.id).then(async () => {
        await this.getExcludeDomains()
        if (isNotification) {
          this.notify(this.$tc('data.notifications.deleted_excluded_domain'), 'success')
        }
      }).catch(() => {
        if (isNotification) {
          this.notify(this.$tc('data.notifications.cannot_deleted_excluded_domain'), 'error')
        }
      })
    },
    async createAuthenticator (otpCipher) {
      const cipher = new CipherView()
      cipher.name = otpCipher.name
      cipher.type = CipherType.SecureNote
      cipher.secureNote = new SecureNote()
      cipher.secureNote.type = 0
      cipher.notes = otpCipher.secretKey;
      const cipherEnc = await this.$cipherService.encrypt(cipher)
      const data = new CipherRequest(cipherEnc)
      data.type = CipherType.OTP;
      data['collectionIds'] = []
      await cystackPlatformAPI.create_ciphers_vault(data)
    },
    async setupFillPage() {
      const tab = await BrowserApi.getTabFromCurrentWindow();
      if (tab) {
        BrowserApi.tabSendMessage(tab, {
          command: "collectPageDetails",
          tab: tab,
          sender: 'notificationBar',
        });
      }
    },
    async closeMenu() {
      setTimeout(async () => {
        const tab = await BrowserApi.getTabFromCurrentWindow();
        BrowserApi.tabSendMessageData(tab, 'closeInformMenu')
      }, 100);
    },
    async scanQRCode(isPasswordOTP = false) {
      const tab = await BrowserApi.getTabFromCurrentWindow();
      if (tab) {
        BrowserApi.tabSendMessage(tab, {
          command: "firstScanQRCode",
          tab: tab,
          isPasswordOTP: isPasswordOTP
        });  
      }
    }
  }
})

Vue.filter('filterPassword', function (value, showPassword) {
  if (value && !showPassword) {
    let result = ''
    for (let i = 0; i < value.length; i++) {
      result += '*'
    }
    return result
  }
  return value
})

Vue.filter('filterString', function (value) {
  return value
})

storePromise().then((store) => {
  middleware()
  store.commit('SET_LANG', store.state.language)
  i18n.locale = store.state.language
  new Vue({
    router,
    store,
    i18n,
    render: h => h(App)
  }).$mount('#app')
})
