import Vue from 'vue'
import Vuex from 'vuex'
import JSLib from "@/popup/services/services";
import {StorageService} from "jslib-common/abstractions/storage.service";
Vue.use(Vuex)

const browserStorageService = JSLib.getBgService<StorageService>('storageService')()
const STORAGE_KEY = 'cs_store'

export default browserStorageService.get(STORAGE_KEY).then(oldStore => {
  let oldStoreParsed = {}
  if (typeof oldStore === 'object') {
    oldStoreParsed = oldStore
  }

  console.log('oldStoreParsed', oldStoreParsed)

  return new Vuex.Store({
    state: {
      init: false,
      isLoggedIn: false,
      user: {
        email: null,
        language: 'vi',
        full_name: '',
        avatar: '',
        organization: '',
        phone: ''
      },
      notifications: {
        results: [],
        unread_count: 0,
        count: 0
      },
      userIntercom: {},
      currentPath: '/',
      previousPath: '',
      isDev: 'dev',
      environment: 'dev',
      loading: false,
      userPw: {
        is_pwd_manager: false
      },
      isLoggedInPw: false,
      syncedCiphersToggle: false,
      syncing: false,
      searchText: '',
      teams: [],
      currentTeam: {},
      currentPlan: {},
      cipherCount: null,
      ...oldStoreParsed
    },
    mutations: {
      INIT_STORE (state, payload) {
        state.isLoggedIn = payload.isLoggedIn || false
        state.user = payload.user || {
          email: null,
          language: 'vi',
          full_name: '',
          avatar: '',
          organization: '',
          phone: ''
        }
        state.userPw = payload.userPw || {}
        state.currentPath = payload.currentPath || '/'
        state.previousPath = payload.previousPath || ''
      },
      SET_LANG (state, {language}) {
        state.user.language = language
      },
      UPDATE_IS_LOGGEDIN (state, isLoggedIn) {
        state.isLoggedIn = isLoggedIn
      },
      CLEAR_ALL_DATA (state) {
        // Auth
        state.isLoggedIn = false
        // // User
        state.user.full_name = ''
        state.user.email = ''
        state.user.avatar = ''
        state.user.organization = ''
        state.user.phone = ''
        state.notifications = {
          results: [],
          unread_count: 0,
          count: 0
        }
        state.teams = []
      },
      UPDATE_USER (state, user) {
        state.user = user
      },
      UPDATE_USER_PW (state, user) {
        state.userPw = user
      },
      UPDATE_USER_INTERCOM (state, userIntercom) {
        state.userIntercom = userIntercom
      },
      UPDATE_PATH (state, {path} ) {
        state.currentPath = path
      },
      UPDATE_PREVIOUS_PATH (state, path) {
        state.previousPath = path || '/vault'
      },
      UPDATE_NOTIFICATION (state, payload) {
        state.notifications = payload
      },
      UPDATE_DEV (state, value) {
        state.environment = value
      },
      UPDATE_LOADING (state, loading) {
        state.loading = loading
      },
      UPDATE_IS_LOGGEDIN_PW (state, value) {
        state.isLoggedInPw = value
      },
      UPDATE_SYNCED_CIPHERS (state) {
        state.syncedCiphersToggle = !state.syncedCiphersToggle
      },
      UPDATE_SYNCING (state, syncing) {
        state.syncing = syncing
      },
      UPDATE_SEARCH (state, value) {
        state.searchText = value
      },
      UPDATE_TEAMS (state, value) {
        state.teams = value
      },
      UPDATE_TEAM (state, value) {
        state.currentTeam = value
      },
      UPDATE_CURRENT_PLAN (state, plan) {
        state.currentPlan = plan
      },
      UPDATE_CIPHER_COUNT (state, value) {
        state.cipherCount = value
      }
    },
    actions: {
      InitStore (context, payload) {
        context.commit('INIT_STORE', payload)
      },
      SetLang ({ commit, state }, payload) {
        commit('SET_LANG', payload)
        return new Promise(resolve => {
          if (state.isLoggedIn) {
            const data = Object.assign({}, state.user)
            data.language = payload
            // eslint-disable-next-line no-undef
            // if (Intercom) {
            //   // eslint-disable-next-line no-undef
            //   Intercom('update', { language_override: payload })
            // }
            Vue.axios.put('me', data)
          }
          resolve(payload)
        })
      },
      LoadCurrentUser ({ commit }) {
        return Vue.axios.get('me')
          .then(res => {
            commit('UPDATE_USER', res)
            return res
          })
      },
      LoadCurrentUserPw ({ commit }) {
        return Vue.axios.get('/cystack_platform/pm/users/me').then(res => {
          commit('UPDATE_USER_PW', res)
          return res
        })
      },
      LoadCurrentIntercom ({ commit }) {
        return Vue.axios.get('me/intercom')
          .then(res => {
            window.intercomSettings = res
            commit('UPDATE_USER_INTERCOM', res)
            Intercom('update')
          })
      },
      LoadNotification ({ commit }) {
        return Vue.axios.get('notifications?scope=cloud')
          .then(res => {
            commit('UPDATE_NOTIFICATION', res)
          })
      },
      LoadTeams ({ commit }) {
        return Vue.axios.get('cystack_platform/pm/teams')
          .then(res => {
            commit('UPDATE_TEAMS', res)
            return res
          })
      },
      LoadCurrentPlan ({ commit }) {
        return Vue.axios.get('cystack_platform/pm/payments/plan')
          .then(res => {
            commit('UPDATE_CURRENT_PLAN', res)
            return res
          })
      }
    },
    modules: {
    },
    plugins: []
  })
})
