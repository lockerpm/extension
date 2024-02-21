import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const store = new Vuex.Store({
  state: {
    language: 'vi',
  },
  mutations: {
    SET_LANG (state, language) {
      state.language = language
    },
  },
  actions: {
  },
  modules: {
  },
  plugins: []
})

export default store
