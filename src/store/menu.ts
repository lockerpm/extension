import Vue from 'vue'
import Vuex from 'vuex'
import { CipherType } from 'jslib-common/enums/cipherType';

Vue.use(Vuex)

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const store = new Vuex.Store({
  state: {
    language: 'en',
    searchText: '',
    initData: {
      tab: 2,
      type: CipherType.Login,
    }
  },
  mutations: {
    SET_LANG (state, language) {
      state.language = language
    },
    UPDATE_SEARCH (state, value) {
      state.searchText = value
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
