import Vue from 'vue'
import Vuex from 'vuex'
import JSLib from "@/popup/services/services";
import RuntimeBackground from '../background/runtime.background';
import {StorageService} from "jslib-common/abstractions/storage.service";

import { v4 as uuidv4 } from 'uuid';

import meAPI from '@/api/me';
import cystackPlatformAPI from '@/api/cystack_platform';
import notificationAPI from '@/api/notification';

Vue.use(Vuex)

const storageService = JSLib.getBgService<StorageService>('storageService')()
const runtimeBackground = JSLib.getBgService<RuntimeBackground>('runtimeBackground')()

const TOKEN_KEY = 'cs_token'
const STORAGE_KEY = 'cs_store'
const USER_KEY = 'cs_user'
const USER_PW_KEY = 'cs_user_pw'

const defaultUser = {
  email: null,
  language: 'en',
  full_name: '',
  avatar: '',
  organization: '',
  phone: ''
}

const defaultLoginInfo = {
  login_step: 1,
  identity: 'mail',
  auth_info: null,
  user_info: null,
  ws2: null,
  clientId: uuidv4(),
  desktopAppInstalled: false,
  desktopAppData: null,
  preloginData: null,
  baseApiUrl: null,
  baseWsUrl: null,
  sending: false,
  forgot_step: 1,
  forgot_token: null
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const asyncStore = async () => {
  const accessToken = await storageService.get(TOKEN_KEY)
  const oldStore: any = await storageService.get(STORAGE_KEY)
  let user: any = await storageService.get(USER_KEY)
  let userPw = await storageService.get(USER_PW_KEY)
  let isLoggedIn = !!accessToken

  if (accessToken && (!user || !user.email)) {
    await meAPI.me().then(async (response) => {
      isLoggedIn = true;
      user = response
    }).catch(async () => {
      isLoggedIn = false;
      user = JSON.parse(JSON.stringify(defaultUser))
    });
    await cystackPlatformAPI.users_me().then(async response => {
      userPw = response
    }).catch(async () => {
      userPw = { is_pwd_manager: false }
    });
    await storageService.save(USER_KEY, user)
    await storageService.save(USER_PW_KEY, userPw)
  }

  let oldStoreParsed = {
    language: 'en',
    ...JSON.parse(JSON.stringify(defaultLoginInfo)),
  }
  if (typeof oldStore === 'object') {
    oldStoreParsed = {
      ...oldStoreParsed,
      ...oldStore,
      isLoggedIn: isLoggedIn
    }
  }
  

  return new Vuex.Store({
    state: {
      init: false,
      isLoggedIn: false,
      user: {
        ...JSON.parse(JSON.stringify(user)),
        language: oldStoreParsed.language,
      },
      userPw: JSON.parse(JSON.stringify(userPw)),
      notifications: {
        results: [],
        unread_count: 0,
        count: 0
      },
      userIntercom: {},
      isDev: 'dev',
      environment: 'dev',
      loading: false,
      syncedCiphersToggle: false,
      syncedExcludeDomains: false,
      syncing: false,
      searchText: '',
      teams: [],
      currentTeam: {},
      currentPlan: {},
      cipherCount: null,
      hideIcons: false,
      showFolders: true,
      enableAutofill:  true,
      callingAPI: false,
      ...oldStoreParsed
    },
    mutations: {
      INIT_STORE (state, payload) {
        state.isLoggedIn = payload.isLoggedIn || false
        state.user = payload.user || JSON.parse(JSON.stringify(defaultUser)),
        state.userPw = payload.userPw || {}
      },
      SET_LANG (state, language) {
        state.user.language = language
      },
      UPDATE_IS_LOGGEDIN (state, isLoggedIn) {
        state.isLoggedIn = isLoggedIn
      },
      CLEAR_ALL_DATA (state) {
        state.use = JSON.parse(JSON.stringify(defaultUser)),
        state.userPw = {}
        state.isLoggedIn = false
        state.notifications = {
          results: [],
          unread_count: 0,
          count: 0
        }
        state.teams = []
      },
      UPDATE_USER (state, user) {
        state.user = user || JSON.parse(JSON.stringify(defaultUser))
      },
      UPDATE_USER_PW (state, user) {
        state.userPw = user
      },
      UPDATE_USER_INTERCOM (state, userIntercom) {
        state.userIntercom = userIntercom
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
      UPDATE_SYNCED_CIPHERS (state) {
        state.syncedCiphersToggle = !state.syncedCiphersToggle
      },
      UPDATE_EXCLUDE_DOMAINS (state) {
        state.syncedExcludeDomains = !state.syncedExcludeDomains
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
      UPDATE_CALLING_API(state, value) {
        state.callingAPI = value
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
        runtimeBackground.updateStoreServiceInfo({
          login_step: state.login_step,
          identity: state.identity,
          auth_info: state.auth_info,
          user_info: state.user_info,
          ws2: state.ws2,
          clientId: state.clientId,
          desktopAppInstalled: state.desktopAppInstalled,
          desktopAppData: state.desktopAppData,
          preloginData: state.preloginData,
          baseApiUrl: state.baseApiUrl,
          baseWsUrl: state.baseWsUrl,
          sending: state.sending,
          forgot_step: state.forgot_step,
          forgot_token: state.forgot_token
        })
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
        await meAPI.me().then(async (response) => {
          commit('UPDATE_IS_LOGGEDIN', true)
          commit('UPDATE_USER', response)
          await storageService.save(USER_KEY, response)
        }).catch(async () => {
          commit('UPDATE_IS_LOGGEDIN', false)
          commit('UPDATE_USER', null)
          await storageService.save(USER_KEY, null)
        });
        
      },
      async LoadCurrentUserPw ({ commit }) {
        await cystackPlatformAPI.users_me().then(async res => {
          commit('UPDATE_USER_PW', res)
          await storageService.save(USER_PW_KEY, res)
        }).catch(async () => {
          commit('UPDATE_USER_PW', {})
          await storageService.save(USER_PW_KEY, {})
        });
      },
      async LoadCurrentIntercom ({ commit }) {
        const res: any = await meAPI.me_intercom();
        self.intercomSettings = res
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
}

export default asyncStore
