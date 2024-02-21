import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const store = new Vuex.Store({
  state: {
    language: 'en',
    isLoggedIn: false,
    searchText: '',
  },
  mutations: {
    SET_LANG (state, language) {
      state.language = language
    },
    UPDATE_IS_LOGGEDIN (state, isLoggedIn) {
      state.isLoggedIn = isLoggedIn
    },
    UPDATE_SEARCH (state, value) {
      state.searchText = value
    },
  },
  actions: {
  },
  modules: {
  },
  plugins: []
})

export default store