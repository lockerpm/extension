import Vue from 'vue'
import Vuex from 'vuex'
import JSLib from "@/popup/services/services";
import RuntimeBackground from '../background/runtime.background';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';
import { StorageService } from "jslib-common/abstractions/storage.service";

import { v4 as uuidv4 } from 'uuid';

import cystackPlatformAPI from '@/api/cystack_platform';
import notificationAPI from '@/api/notification';

Vue.use(Vuex)

const storageService = JSLib.getBgService<StorageService>('storageService')()
const runtimeBackground = JSLib.getBgService<RuntimeBackground>('runtimeBackground')()
const vaultTimeoutService = JSLib.getBgService<VaultTimeoutService>('vaultTimeoutService')()

const STORAGE_KEY = 'cs_store'
const USER_PW_KEY = 'cs_user_pw'

const defaultLoginInfo = {
  login_step: 1,
  identity: 'mail',
  auth_info: null,
  clientId: uuidv4(),
  baseApiUrl: null,
  baseWsUrl: null,
  sending: false,
  forgot_step: 1,
  forgot_token: null
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const asyncStore = async () => {
  return await Promise.all([
    storageService.get(STORAGE_KEY),
    storageService.get(USER_PW_KEY),
  ]).then(async ([oldStore, storeUserPw]) => {
    const userPw: any = storeUserPw || null

    let oldStoreParsed = {
      language: userPw?.language ||'en',
      ...JSON.parse(JSON.stringify(defaultLoginInfo)),
    }
    if (typeof oldStore === 'object') {
      oldStoreParsed = {
        ...oldStoreParsed,
        ...oldStore,
      }
    }

    return new Vuex.Store({
      state: {
        init: false,
        isLoggedIn: !!userPw?.email,
        language: userPw?.language || 'en',
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
        hideIcons: false,
        showFolders: true,
        enableAutofill:  true,
        callingAPI: false,

        // service
        isConnected: false,
        isDesktopConnected: false,
        approveCode: null,
        clientId: null,
        clientType: null,
        pairingConfirmed: false,
        isTouch: false,
        isFingerprint: false,

        ...oldStoreParsed,
      },
      mutations: {
        SET_LANG (state, language) {
          state.language = language
        },
        UPDATE_IS_LOGGEDIN (state, isLoggedIn) {
          state.isLoggedIn = isLoggedIn
        },
        CLEAR_ALL_DATA (state) {
          state.userPw = null
          state.isLoggedIn = false
          state.notifications = {
            results: [],
            unread_count: 0,
            count: 0
          }
          state.teams = []
        },
        async UPDATE_USER_PW (state, userPw) {
          state.userPw = userPw
          await storageService.save(USER_PW_KEY, userPw)
          await vaultTimeoutService.setVaultTimeoutOptions(
            userPw.timeout,
            userPw.timeout_action
          );
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
        UPDATE_IS_CONNECTED (state, isConnected) {
          state.isConnected = isConnected
        },
        UPDATE_IS_DESKTOP_CONNECTED (state, isDesktopConnected) {
          state.isDesktopConnected = isDesktopConnected
        },
        UPDATE_APPROVE_CODE (state, approveCode) {
          state.approveCode = approveCode
        },
        UPDATE_CLIENT_ID (state, clientId) {
          state.clientId = clientId
        },
        UPDATE_CLIENT_TYPE (state, clientType) {
          state.clientType = clientType
        },
        UPDATE_PAIRING_CONFIRMED (state, pairingConfirmed) {
          state.pairingConfirmed = pairingConfirmed
        },
        UPDATE_IS_TOUCH (state, isTouch) {
          state.isTouch = isTouch
        },
        UPDATE_IS_FINGERPRINT (state, isFingerprint) {
          state.isFingerprint = isFingerprint
        },
        async UPDATE_LOGIN_PAGE_INFO(state, info) {
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
          await runtimeBackground.updateStoreServiceInfo({
            login_step: state.login_step,
            identity: state.identity,
            auth_info: state.auth_info,
            clientId: state.clientId,
            baseApiUrl: state.baseApiUrl,
            baseWsUrl: state.baseWsUrl,
            sending: state.sending,
            forgot_step: state.forgot_step,
            forgot_token: state.forgot_token
          })
        },
      },
      actions: {
        SetLang ({ commit, state }, payload) {
          commit('SET_LANG', payload)
        },
        async LoadCurrentUserPw ({ commit }) {
          await cystackPlatformAPI.users_me().then(async res => {
            commit('UPDATE_USER_PW', res)
          }).catch(async () => {
            commit('UPDATE_USER_PW', {})
          });
        },
        async LoadNotification ({ commit }) {
          const res = await notificationAPI.get({ scope: 'cloud' });
          commit('UPDATE_NOTIFICATION', res)
          return res
        },
        async LoadTeams ({ commit }) {
          const res = await cystackPlatformAPI.teams({ paging: 0 });
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
}

export default asyncStore
