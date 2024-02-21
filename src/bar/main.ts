// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import Vue from 'vue'

import AsyncComputed from 'vue-async-computed'
import Clipboard from 'vue-clipboard2'
import Element from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en'
import moment from "moment";
import VueMomentJS from "vue-momentjs";

import App from '@/bar/App.vue'
import router from '@/router/bar'
import storePromise from '@/store'

import i18n from '@/locales/i18n'
import cystackPlatformAPI from '@/api/cystack_platform'

Vue.config.productionTip = false;

Vue.use(AsyncComputed)
Vue.use(Clipboard)
Vue.use(Element, { locale })
Vue.use(VueMomentJS, moment);

import '@fortawesome/fontawesome-free/css/all.min.css';
import '@/assets/css/index.scss'
import '@/assets/css/bar.scss'

Vue.mixin({
  data() {
    return {
    };
  },
  computed: {
  },
  methods: {
    async getExcludeDomains() {
      await cystackPlatformAPI.exclude_domains().then(response => {
        this.$cipherService.saveNeverDomains(response.results)
        this.$store.commit("UPDATE_EXCLUDE_DOMAINS");
      }).catch(() => {
        this.$cipherService.saveNeverDomains([])
        this.$store.commit("UPDATE_EXCLUDE_DOMAINS");
      })
    },
    sanitizeUrl(connectionUrl) {
      if (connectionUrl.startsWith('//')) {
        const scheme = self.location.protocol === 'https:' ? 'wss' : 'ws'
        connectionUrl = `${scheme}:${connectionUrl}`
      }

      return connectionUrl
    },
    async reconnectDesktopAppSocket () {
      //
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
  }
})

storePromise().then((store) => {
  store.commit('SET_LANG', store.state.language)
  i18n.locale = store.state.language
  new Vue({
    router,
    store,
    i18n,
    render: h => h(App)
  }).$mount('#bar-app')
})
