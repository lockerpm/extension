import ENDPOINT from '@/config/endpoint'
import router from '@/router/popup'
import JSLib from '@/popup/services/services'
const browserStorageService = JSLib.getBgService('storageService')()
import storePromise from '@/store'

export function handleResponseErrorMessage(error) {
  if (error.response) {
    if (error.response.status === 404) {
      router.push({ name: 'Home' })
    }
    if (error.response.status === 401) {
      if (error.response.config.url !== ENDPOINT.SSO_AUTH) {
        console.log('error', error.response);
        chrome.runtime.sendMessage({ command: "logout" });
        browserStorageService.remove('cs_token')
        storePromise.then((store) => {
          store.commit('UPDATE_LOGIN_PAGE_INFO', null)
          store.commit('UPDATE_IS_LOGGEDIN', false)
          store.commit('CLEAR_ALL_DATA')

          chrome.runtime.sendMessage({
            command: 'updateStoreService',
            sender: { key: 'isLoggedIn', value: false },
          });

          if (router.currentRoute.name !== 'login') {
            router.push({ name: "login" });
          }
        })
      }
    }
  }
  return error
}
