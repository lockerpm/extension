import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const store = new Vuex.Store({
  state: {
    language: 'en',
    initData: {
      cipherId: null,
      username: '',
      password: '',
      newPassword: '',
      domain: '',
    }
  },
  mutations: {
    SET_LANG (state, language) {
      state.language = language
    },
    UPDATE_INIT_DATA (state, value) {
      state.initData = value
    },
  },
  actions: {
  },
  modules: {
  },
  plugins: []
})

export default store
