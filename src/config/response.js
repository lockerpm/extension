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
      if ([ENDPOINT.SSO_AUTH].includes(error.response.config.url)) {
        console.log('error', error.response);
        browserStorageService.remove('cs_token')
        storePromise.then((store) => {
          store.commit('UPDATE_LOGIN_PAGE_INFO', null)
          store.commit('UPDATE_IS_LOGGEDIN', false)
          store.commit('CLEAR_ALL_DATA')

          setTimeout(() => {
            chrome.runtime.sendMessage({
              command: 'updateStoreService',
              sender: { key: 'isLoggedIn', value: false },
            });
  
            if (router.currentRoute.name !== 'login') {
              router.push({ name: "login" });
            }
          }, 1000);
        })
      }
    }
  }
  return error
}