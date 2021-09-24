import Vue from 'vue'
import Vuex from 'vuex'
import BrowserStorageService from '@/services/browserStorage.service'
Vue.use(Vuex)

const browserStorageService = new BrowserStorageService();
const STORAGE_KEY = 'cs-store'

export default new Vuex.Store({
  state: {
    token: '',
    test: '',
    init: false
  },
  mutations: {
    UPDATE_TOKEN (state, payload) {
      state.token = payload.token
    },
    UPDATE_TEST (state, payload) {
      state.test = payload
    },
    INIT_STORE (state, payload) {
      state.token = payload.token
      console.log(state)
    }
  },
  actions: {
    UpdateToken (context, payload) {
      context.commit('UPDATE_TOKEN', payload)
    },
    InitStore (context, payload) {
      context.commit('INIT_STORE', payload)
    }
  },
  modules: {
  },
  plugins: [
    (store) => {
      store.subscribe((mutation, state) => {
        if (mutation.payload && mutation.payload.force) {
          const syncedData = { token: state.token }
          browserStorageService.save(STORAGE_KEY, JSON.stringify(syncedData))
        }

        if (mutation.type === 'CLEAR_ALL_DATA') {
          browserStorageService.remove(STORAGE_KEY)
        }
      })
    }
  ]
})
