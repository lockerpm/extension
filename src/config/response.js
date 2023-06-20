/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import router from '@/router/popup'
import JSLib from '@/popup/services/services'
const browserStorageService = JSLib.getBgService('storageService')()
import storePromise from '@/store';
import { BrowserApi } from "@/browser/browserApi";

export function handleResponseErrorMessage(error) {
  if (error.response) {
    if (error.response.status === 404) {
      router.push({ name: 'Home' })
    }
    if (error.response.status === 401) {
      browserStorageService.remove('cs_token')
      storePromise.then(async (store) => {
        store.commit('UPDATE_LOGIN_PAGE_INFO', null)
        const page = BrowserApi.getBackgroundPage();
        await page.bitwardenMain.onLogout(false)
        store.commit('UPDATE_IS_LOGGEDIN', false)
        store.commit('CLEAR_ALL_DATA')

        setTimeout(() => {
          if (router.currentRoute.name !== 'login') {
            router.push({ name: "login" });
          }
        }, 1000);
      })
    }
  }
  return error
}
