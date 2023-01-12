// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import Vue from 'vue'

import axios from 'axios'
import VueAxios from 'vue-axios'
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
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { CipherType } from "jslib-common/enums/cipherType";
import { SyncResponse } from "jslib-common/models/response/syncResponse";
import { WALLET_APP_LIST } from "@/utils/crypto/applist/index";

Vue.config.productionTip = false
Vue.use(JSLib)
Vue.use(AsyncComputed)
Vue.use(Clipboard)
Vue.use(Element, { locale })
Vue.use(VueMomentJS, moment);
Vue.use(VueNativeSock, "ws://192.168.0.186:8000", {
  connectManually: true
});
if (process.env.NODE_ENV==='development') {
  require('@/assets/buildtw.css')
}

import '@fortawesome/fontawesome-free/css/all.min.css'
import '@/assets/tailwind.css'
import '@/assets/app.scss'
import find from "lodash/find";
import { nanoid } from 'nanoid'
import { Avatar } from "element-ui";
import extractDomain from "extract-domain";

Vue.mixin({
  data () {
    return {
      folders: [],
      strategies: [
        { key: "google", name: "Google", color: "#4284f4" },
        { key: "facebook", name: "Facebook", color: "#3c65c4" },
        { key: "github", name: "GitHub", color: "#202326" }
      ],
      enableAutofillKey : 'enableAutofill',
      showFoldersKey : 'showFolders',
      hideIconsKey : 'hideIcons'
    };
  },
  computed: {
    language () { return this.$store.state.user.language },
    currentUser () { return this.$store.state.user },
    currentUserPw () { return this.$store.state.userPw },
    environment () { return this.$store.state.environment },
    isLoggedIn () { return this.$store.state.isLoggedIn },
    isAllPage () { return this.$route.name === 'vault' },
    searchText () { return this.$store.state.searchText },
    teams () { return this.$store.state.teams || [] },
    currentOrg () { return find(this.teams, team => team.id === this.$route.params.teamId) || {} },
    currentPlan() { return this.$store.state.currentPlan },
    cipherCount () {
      return this.$store.state.cipherCount
    },
    hideIcons() {
      return this.$store.state.hideIcons
    },
    showFolders() {
      return this.$store.state.showFolders
    },
    enableAutofill() {
      return this.$store.state.enableAutofill
    }
  },
  methods: {
    changeLang (value) {
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
      })
    },
    async logout () {
      console.log('###### LOG OUT')
      const userId = await this.$userService.getUserId()
      await this.axios.post('/users/logout')
      await Promise.all([
        this.$cryptoService.clearKeys(),
        this.$userService.clear(),
        this.$folderService.clear(userId),
        this.$collectionService.clear(userId),
        this.$cipherService.clear(userId),
        this.$settingsService.clear(userId),
        this.$policyService.clear(userId),
        this.$tokenService.clearToken(),
        this.$storageService.remove("cs_token")
      ]);
      this.$store.commit('UPDATE_IS_LOGGEDIN', false)
      this.$router.push({ name: 'login' })
    },
    async lock () {
      await Promise.all([
        this.$cryptoService.clearKey(),
        this.$cryptoService.clearOrgKeys(true),
        this.$cryptoService.clearKeyPair(true),
        this.$cryptoService.clearEncKey(true)
      ])

      this.$folderService.clearCache()
      this.$cipherService.clearCache()
      this.$collectionService.clearCache()
      this.$router.push({ name: 'lock' })
    },
    randomString () {
      return nanoid()
    },
    notify (message, type, html = false, duration = 8000) {
      this.$notify({
        title: String(this.$t(`common.${type}`)),
        message,
        type,
        duration,
        dangerouslyUseHTMLString: html
      })
    },
    async genKey (masterPassword, email) {
      try {
        const key = await this.$cryptoService.makeKey(masterPassword, email, 0, 100000)
        const hashedPassword = await this.$cryptoService.hashPassword(masterPassword, key)
        return hashedPassword
      } catch (e) {
        return ''
      }
    },
    async login() {
      const browserStorageService = JSLib.getBgService<StorageService>('storageService')()
      const [deviceId, hideIcons, showFolders, enableAutofill] = await Promise.all([
        browserStorageService.get("device_id"),
        browserStorageService.get("hideIcons"),
        browserStorageService.get("showFolders"),
        browserStorageService.get("enableAutofill"),
      ]);
      this.$store.commit('UPDATE_HIDE_ICONS', hideIcons)
      this.$store.commit("UPDATE_SHOW_FOLDERS", showFolders);
      this.$store.commit("UPDATE_ENABLE_AUTOFILL", enableAutofill);
      const deviceIdentifier = deviceId || this.randomString();
      if (!deviceId) {
        browserStorageService.save("device_id", deviceIdentifier);
      }
      try {
        await this.clearKeys()
        const key = await this.$cryptoService.makeKey(this.masterPassword, this.currentUser.email, 0, 100000)
        const hashedPassword = await this.$cryptoService.hashPassword(this.masterPassword, key)
        const res = await this.axios.post('cystack_platform/pm/users/session', {
          client_id: 'browser',
          password: hashedPassword,
          device_name: this.$platformUtilsService.getDeviceString(),
          device_type: this.$platformUtilsService.getDevice(),
          device_identifier: deviceIdentifier
        })
        chrome.runtime.sendMessage({command: 'loggedIn'})
        await this.$tokenService.setTokens(res.access_token, res.refresh_token)
        await this.$userService.setInformation(this.$tokenService.getUserId(), this.currentUser.email, 0, 100000)
        await this.$cryptoService.setKey(key)
        await this.$cryptoService.setKeyHash(hashedPassword)
        await this.$cryptoService.setEncKey(res.key)
        await this.$cryptoService.setEncPrivateKey(res.private_key)

        if (this.$vaultTimeoutService != null) {
          this.$vaultTimeoutService.biometricLocked = false
        }
        chrome.runtime.sendMessage({ command: "unlocked" });
        this.$router.push({ name: 'home' })
      } catch (e) {
        console.log(e)
        this.notify(this.$t("errors.invalid_master_password"), "error");
      }
    },
    async clearKeys () {
      await this.$cryptoService.clearKeys()
    },
    async getSyncData (trigger=false) {
      this.$store.commit('UPDATE_SYNCING', true)
      const pageSize = 100
      try {
        let page = 1
        let allCiphers = []
        const userId = await this.$userService.getUserId()
        this.$messagingService.send('syncStarted')
        // eslint-disable-next-line no-constant-condition
        while (true) {
          let res = await this.axios.get(`cystack_platform/pm/sync?paging=1&size=${pageSize}&page=${page}`)
          if (res.count && res.count.ciphers) {
            this.$store.commit('UPDATE_CIPHER_COUNT', res.count.ciphers)
          }
          res = new SyncResponse(res)
          allCiphers = allCiphers.concat(res.ciphers)
          await this.$syncService.syncProfile(res.profile)
          await this.$syncService.syncFolders(userId, res.folders);
          await this.$syncService.syncCollections(res.collections);
          await this.$syncService.syncSomeCiphers(userId, res.ciphers);
          await this.$syncService.syncSends(userId, res.sends);
          await this.$syncService.syncSettings(userId, res.domains);
          await this.$syncService.syncPolicies(res.policies);
          await this.$syncService.setLastSync(new Date());
          this.$store.commit("UPDATE_SYNCED_CIPHERS");
          if (page * pageSize >= this.cipherCount) {
            break
          }
          page += 1
        }

        const deletedIds = [];
        const cipherIds = allCiphers.map(c => c.id);
        const storageRes = await this.$storageService.get(`ciphers_${userId}`);
        for (const id in { ...storageRes }) {
          if (!cipherIds.includes(id)) {
            delete storageRes[id];
            deletedIds.push(id);
          }
        }
        await this.$storageService.save(`ciphers_${userId}`, storageRes);

        this.$cipherService.csDeleteFromDecryptedCache(deletedIds);
        this.$store.commit("UPDATE_SYNCED_CIPHERS");
        this.$messagingService.send('syncCompleted', { successfully: true, trigger })
      } catch (e) {
        this.$messagingService.send('syncCompleted', { successfully: false, trigger })
        this.$store.commit('UPDATE_SYNCED_CIPHERS')
      } finally {
        this.$store.commit('UPDATE_SYNCING', false)
      }
    },
    async getFolders () {
      return await this.$folderService.getAllDecrypted()
    },
    clipboardSuccessHandler () {
      this.notify(this.$t('common.copied'), 'success')
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
    getIconDefaultCipher (type, size = 70) {
      return this.$createElement('img', {
        attrs: {
          src: require(`@/assets/images/icons/icon_${type}.svg`),
          style: `height: ${size}px`,
          class: 'rounded mx-auto'
        }
      })
    },
    routerCipher (cipher, callbackDeleted) {
      if (cipher.isDeleted) {
        callbackDeleted(cipher)
        return
      }
      if (this.$route.name === 'vault') {
        this.$router.push({
          name: 'vault-id',
          params: { id: cipher.id }
        })
        return
      }
      if (this.$route.name === "home") {
        this.$router.push({
          name: "home-id",
          params: { id: cipher.id }
        });
        return;
      }
      if (this.$route.name === 'vault-folders-folderId') {
        this.$router.push({
          name: 'vault-folders-folderId-id',
          params: { ...this.$route.params, id: cipher.id }
        })
        return
      }

      if (this.$route.name === 'vault-teams-teamId-tfolders-tfolderId') {
        this.$router.push({
          name: 'vault-teams-teamId-tfolders-tfolderId-id',
          params: { ...this.$route.params, id: cipher.id }
        })
        return
      }

      let name = ''
      switch (cipher.type) {
      case CipherType.Login:
        name = 'passwords'
        break
      case CipherType.SecureNote:
        name = 'notes'
        break
      case CipherType.Card:
        name = 'cards'
        break
      case CipherType.Identity:
        name = 'identities'
        break
      }
      this.$router.push({
        name: name + '-id',
        params: { id: cipher.id }
      })
    },
    getTeam (teams, orgId) {
      return find(teams, e => e.id === orgId) || {}
    },
    canManageItem (teams, item) {
      const team = this.getTeam(teams, item.organizationId)
      if (team.id) {
        return [0, 1].includes(team.type);
      }
      return true
    },
    canManageFolder (teams, item) {
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
      window.open(link, '_blank')
    },
    sanitizeUrl (connectionUrl) {
      if (connectionUrl.startsWith('//')) {
        const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
        connectionUrl = `${scheme}:${connectionUrl}`
      }

      return connectionUrl
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

storePromise.then((store) => {
  const browserStorageService = JSLib.getBgService<StorageService>('storageService')()
  axios.interceptors.request.use(
    async (config) => {
      const token = await browserStorageService.get('cs_token')
      const deviceId = await browserStorageService.get('device_id')
      if (token) {
        config.headers['Authorization'] = `Bearer ${ token }`
      }
      if (deviceId) {
        config.headers['device-id'] = deviceId
      }
      config.baseURL = process.env.VUE_APP_BASE_API_URL
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )
  axios.interceptors.response.use(
    (response) => {
      if (response.headers['device-id']) {
        browserStorageService.save("device_id", response.headers["device-id"]);
      }
      return response && response.data
    },
    (error) => {
      if (error.response) {
        if (error.response.status === 404) {
          router.push({name: 'Home'})
        }
        if (error.response.status === 401) {
          browserStorageService.remove('cs_token')
          store.commit('UPDATE_IS_LOGGEDIN', false)
          if (router.currentRoute.name !== 'login') {
            router.push({ name: "login" });  
          }
        }
      }
      return Promise.reject(error)
    }
  )
  Vue.use(VueAxios, axios)
  new Vue({
    router,
    store,
    i18n,
    render: h => h(App)
  }).$mount('#app')
})
