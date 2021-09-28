import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueCookies from 'vue-cookies'

import App from '@/popup/App.vue'
import router from '@/router'
import store from '@/store'
import JSLib from '@/popup/services/services'
import { StorageService } from 'jslib-common/abstractions/storage.service';

Vue.config.productionTip = false
Vue.use(JSLib)
Vue.use(VueCookies)

const browserStorageService = JSLib.getBgService<StorageService>('storageService')()

axios.interceptors.request.use(
  async (config) => {
    const token = await browserStorageService.get('cs_token')
    console.log('axios', token)
    if (token) {
      config.headers['Authorization'] = `Bearer ${ token }`
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
    return response && response.data
  },
  (error) => {
    console.log(error.response)
    if (error.response) {
      if (error.response.status === 404) {
        router.push({name: 'About'})
      }
      if (error.response.status === 401) {
        browserStorageService.remove('cs_token')
      }
    }
    return Promise.reject(error)
  }
)
Vue.use(VueAxios, axios)


import '@/assets/tailwind.css'
import '@/assets/app.scss'

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
