/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import router from '@/router/popup'
import JSLib from '@/popup/services/services'
const storageService = JSLib.getBgService('storageService')();

import storePromise from '@/store'

export function handleResponseErrorMessage(error) {
  if (error.response) {
    if (error.response.status === 404) {
      router.push({ name: 'vault' })
    }
    if (error.response.status === 401) {
      storageService.remove('cs_token')
      storePromise().then(async (store) => {
        await store.commit('UPDATE_LOGIN_PAGE_INFO', null)
        await self.lockerMain.onLogout(false)
        store.commit('CLEAR_ALL_DATA')
        if (router.currentRoute.name !== 'login' && !router.currentRoute.meta?.isOver) {
          router.push({ name: "login" }).catch(() => ({}));
          await storageService.save('current_router', JSON.stringify({ name: "login" }))
        }
      })
    }
  }
  return error
}
