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
import store from '@/store/bar'

import JSLib from '@/services'
import i18n from '@/locales/i18n'

Vue.config.productionTip = false;

Vue.use(AsyncComputed)
Vue.use(JSLib)
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
  }
})

store.commit('SET_LANG', store.state.language)
i18n.locale = store.state.language
new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#bar-app')
