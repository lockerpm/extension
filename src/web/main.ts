// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import Vue from 'vue'

import axios from 'axios'
import VueAxios from 'vue-axios'
import VueCookies from 'vue-cookies'
import AsyncComputed from 'vue-async-computed'
import Clipboard from 'vue-clipboard2'
import Element from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'
import moment from "moment";
import numeral from "numeral";
import VueMomentJS from "vue-momentjs";
import VueNativeSock from 'vue-native-websocket'
import App from '@/popup/App.vue'
import router from '@/router/web'
import storePromise from '@/store/web'
import i18n from '@/locales/i18n'
import JSLib from '@/popup/services/services'
import { StorageService } from 'jslib-common/abstractions/storage.service';
import { CipherType } from "jslib-common/enums/cipherType";
import { SyncResponse } from "jslib-common/models/response/syncResponse";


Vue.config.productionTip = false
Vue.use(AsyncComputed)
Vue.use(JSLib)
Vue.use(VueCookies)
Vue.use(Clipboard)
Vue.use(Element, { locale })
Vue.use(VueMomentJS, moment);
Vue.use(VueNativeSock, 'ws://192.168.0.186:8000', {
  connectManually: true
})

import '@fortawesome/fontawesome-free/css/all.min.css'
import '@/assets/buildtw.css'
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
      ]
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
    currentPlan() { return this.$store.state.currentPlan }
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
            dow: 1 // Monday is the first day of the week.
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
      await this.axios.post('/users/logout')
      await this.$cryptoService.clearKeys()
      await this.$userService.clear()
      await this.$storageService.remove('cs_token')
      this.$store.commit('UPDATE_IS_LOGGEDIN', false)
      this.$router.push({ name: 'home' })
    },
    async lock () {
      await Promise.all([
        this.$cryptoService.clearKey(false),
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
      const deviceId = await browserStorageService.get('device_id')
      const deviceIdentifier = deviceId || this.randomString()
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
        this.$messagingService.send('loggedIn')
        await this.$tokenService.setTokens(res.access_token, res.refresh_token)
        await this.$userService.setInformation(this.$tokenService.getUserId(), this.currentUser.email, 0, 100000)
        await this.$cryptoService.setKey(key)
        await this.$cryptoService.setKeyHash(hashedPassword)
        await this.$cryptoService.setEncKey(res.key)
        await this.$cryptoService.setEncPrivateKey(res.private_key)

        if (this.$vaultTimeoutService != null) {
          this.$vaultTimeoutService.biometricLocked = false
        }
        this.$messagingService.send('unlocked')
        this.$router.push({ name: 'vault' })
      } catch (e) {
        this.notify('Xác thực thông tin thất bại', 'warning')
      }
    },
    async clearKeys () {
      await this.$cryptoService.clearKeys()
    },
    async getSyncData () {
      try {
        this.$messagingService.send('syncStarted')
        let res = await this.axios.get('cystack_platform/pm/sync')
        res = new SyncResponse(res)

        const userId = await this.$userService.getUserId()
        await this.$syncService.syncProfile(res.profile)
        await this.$syncService.syncFolders(userId, res.folders)
        await this.$syncService.syncCollections(res.collections)
        await this.$syncService.syncCiphers(userId, res.ciphers)
        await this.$syncService.syncSends(userId, res.sends)
        await this.$syncService.syncSettings(userId, res.domains)
        await this.$syncService.syncPolicies(res.policies)
        await this.$syncService.setLastSync(new Date())
        this.$messagingService.send('syncCompleted', { successfully: true })
        this.$store.commit('UPDATE_SYNCED_CIPHERS')
      } catch (e) {
        this.$messagingService.send('syncCompleted', { successfully: false })
        this.$store.commit('UPDATE_SYNCED_CIPHERS')
      }
    },
    async getFolders () {
      return await this.$folderService.getAllDecrypted()
    },
    clipboardSuccessHandler () {
      this.notify(this.$t('common.copied'), 'success')
    },
    getIconCipher (cipher, size = 70) {
      switch (cipher.type) {
      case CipherType.Login:
        if (cipher.login && cipher.login.uris && cipher.login.uris.length) {
          try {
            const domain = extractDomain(cipher.login.uris[0]._uri)
            if (domain) {
              return (this.$createElement(Avatar, {
                props: {
                  src: `${process.env.VUE_APP_LOGO_URL}${domain}?size=${size}`,
                  size,
                  alt: domain,
                  shape: 'square'
                }
              }, [
                this.$createElement('img', {
                  attrs: {
                    src: require('@/assets/images/icons/icon_Login.svg')
                  }
                })
              ]))
            }
          } catch (e) {
            return this.getIconDefaultCipher('Login', size)
          }
        }
        return this.getIconDefaultCipher('Login', size)
      case CipherType.SecureNote:
        return this.getIconDefaultCipher('SecureNote', size)
      case CipherType.Card:
        return this.getIconDefaultCipher('Card', size)
      case CipherType.Identity:
        return this.getIconDefaultCipher('Identity', size)
      case 'Shares':
        return this.getIconDefaultCipher('Shares', size)
      case 'Trash':
        return this.getIconDefaultCipher('Trash', size)
      case 'Vault':
        return this.getIconDefaultCipher('Dashboard', size)
      default:
        return ''
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
      this.$router.push({
        name: "vault-id",
        params: { id: cipher.id }
      });
      return;
    },
    getTeam (teams, orgId) {
      return find(teams, e => e.id === orgId) || {}
    },
    canManageItem (teams, item) {
      const team = this.getTeam(teams, item.organizationId)
      if (team.organization_id) {
        return ['owner', 'admin', 'manager'].includes(team.role)
      }
      return true
    },
    openNewTab (link) {
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

Vue.filter('formatPercentage', function (value) {
  if (!Number.isNaN(value)) {
    return numeral(value).format('0.[00]')
  }
  return 0
})

Vue.filter('formatNumber', function (value) {
  if (!Number.isNaN(value)) {
    return numeral(value).format('0,0.[00]')
  }
  return 0
})

storePromise.then((store) => {
  router.beforeEach(async (toRoute, fromRoute, next) => {
    if (fromRoute && toRoute && fromRoute.path && toRoute.path
      && !fromRoute.path.includes('/login')
      && !toRoute.path.includes('/login')
      && !fromRoute.path.includes('/lock')
      && !toRoute.path.includes('/lock')
      && !fromRoute.path.includes('/set-master-password')
      && !toRoute.path.includes('/set-master-password')
    ) {
      store.commit('UPDATE_PATH', toRoute.fullPath)
      store.commit('UPDATE_PREVIOUS_PATH', fromRoute.fullPath)
    }
    next()
  })
  const browserStorageService = JSLib.getBgService<StorageService>('storageService')()
  axios.interceptors.request.use(
    async (config) => {
      const token = await browserStorageService.get("cs_token");
      const deviceId = await browserStorageService.get("device_id");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      if (deviceId) {
        config.headers["device-id"] = deviceId;
      }
      config.baseURL = process.env.VUE_APP_BASE_API_URL;
      return config;
    },
    (error) => {
      return Promise.reject(error)
    }
  )
  axios.interceptors.response.use(
    (response) => {
      if (response.headers["device-id"]) {
        browserStorageService.save("device_id", response.headers["device-id"]);
      }
      return response && response.data
    },
    (error) => {
      if (error.response) {
        if (error.response.status === 404) {
          router.push({name: 'home'})
        }
        if (error.response.status === 401) {
          browserStorageService.remove('cs_token')
          store.commit('UPDATE_IS_LOGGEDIN', false)
          router.push({name: 'login'})
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