import Vue from 'vue'
import Vuex from 'vuex'
import JSLib from "@/popup/services/services";
import {StorageService} from "jslib-common/abstractions/storage.service";
import uuid from 'uuid';

import meAPI from '@/api/me';
import cystackPlatformAPI from '@/api/cystack_platform';
import notificationAPI from '@/api/notification';

Vue.use(Vuex)

const browserStorageService = JSLib.getBgService<StorageService>('storageService')()
const STORAGE_KEY = 'cs_store'

const defaultLoginInfo = {
  optionValue: '',
  login_step: 1,
  identity: 'mail',
  auth_info: null,
  user_info: null,
  ws2: null,
  clientId: uuid(),
  desktopAppInstalled: false,
  desktopAppData: null,
  preloginData: null
}

export default browserStorageService.get(STORAGE_KEY).then(oldStore => {
  let oldStoreParsed = {
    language: 'en',
    ...JSON.parse(JSON.stringify(defaultLoginInfo)),
  }
  if (typeof oldStore === 'object') {
    oldStoreParsed = {
      ...oldStoreParsed,
      ...oldStore
    }
  }

  return new Vuex.Store({
    state: {
      init: false,
      isLoggedIn: false,
      user: {
        email: null,
        language: oldStoreParsed.language,
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
      hideIcons: false,
      showFolders: true,
      enableAutofill:  true,
      ...oldStoreParsed
    },
    mutations: {
      INIT_STORE (state, payload) {
        state.isLoggedIn = payload.isLoggedIn || false
        state.user = payload.user || {
          email: null,
          language: 'en',
          full_name: '',
          avatar: '',
          organization: '',
          phone: ''
        }
        state.userPw = payload.userPw || {}
        state.currentPath = payload.currentPath || '/'
        state.previousPath = payload.previousPath || ''
      },
      SET_LANG (state, language) {
        state.user.language = language
      },
      UPDATE_IS_LOGGEDIN (state, isLoggedIn) {
        state.isLoggedIn = isLoggedIn
      },
      CLEAR_ALL_DATA (state) {
        // Auth
        state.isLoggedIn = false
        // User
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
      },
      UPDATE_HIDE_ICONS(state, value) {
        state.hideIcons = value
      },
      UPDATE_SHOW_FOLDERS(state, value) {
        state.showFolders = value
      },
      UPDATE_ENABLE_AUTOFILL(state, value) {
        state.enableAutofill = value
      },
      UPDATE_LOGIN_PAGE_INFO(state, info) {
        let keys = []
        const defaultData = info || JSON.parse(JSON.stringify(defaultLoginInfo))
        if (info) {
          keys = Object.keys(defaultData)
        } else {
          keys = Object.keys(defaultData)
        }
        keys.forEach((key) => {
          state[key] = defaultData[key]
        });
        chrome.runtime.sendMessage({
          command: 'updateStoreServiceInfo',
          sender: {
            optionValue: state.optionValue,
            login_step: state.login_step,
            identity: state.identity,
            auth_info: state.auth_info,
            user_info: state.user_info,
            ws2: state.ws2,
            clientId: state.clientId,
            desktopAppInstalled: state.desktopAppInstalled,
            desktopAppData: state.desktopAppData,
            preloginData: state.preloginData,
          },
        });
      },
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
            meAPI.update(data);
          }
          resolve(payload)
        })
      },
      async LoadCurrentUser ({ commit }) {
        const res = await meAPI.me();
        commit('UPDATE_IS_LOGGEDIN', true)
        commit('UPDATE_USER', res)
        return res
      },
      async LoadCurrentUserPw ({ commit }) {
        const res = await cystackPlatformAPI.users_me();
        commit('UPDATE_USER_PW', res)
        return res
      },
      async LoadCurrentIntercom ({ commit }) {
        const res: any = await meAPI.me_intercom();
        window.intercomSettings = res
        commit('UPDATE_USER_INTERCOM', res)
        Intercom('update')
      },
      async LoadNotification ({ commit }) {
        const res = await notificationAPI.get({ scope: 'cloud' });
        commit('UPDATE_NOTIFICATION', res)
        return res
      },
      async LoadTeams ({ commit }) {
        const res = await cystackPlatformAPI.teams();
        commit('UPDATE_TEAMS', res)
        return res
      },
      async LoadCurrentPlan ({ commit }) {
        const res = await cystackPlatformAPI.payments_plan();
        commit('UPDATE_CURRENT_PLAN', res)
        return res
      },
    },
    modules: {
    },
    plugins: []
  })
})
