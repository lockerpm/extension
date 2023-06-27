import router from './router/popup'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import storePromise from "./store";
import JSLib from '@/popup/services/services'
const browserStorageService = JSLib.getBgService('storageService')()
const vaultTimeoutService = JSLib.getBgService('vaultTimeoutService')()

let isFirst = true

NProgress.configure({ showSpinner: false })

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  const store = await storePromise;
  const isLocked = await vaultTimeoutService.isLocked()
  const accessToken = await browserStorageService.get('cs_token')
  if (to.meta?.isOver) {
    next();
  } else if (isFirst) {
    isFirst = false
    const currentRouterString = await browserStorageService.get('current_router')
    const currentRouter = JSON.parse(currentRouterString)
    const allRouters = router.options.routes.map(o => o.children).flat();
    if (allRouters.find(r => currentRouter && r.name === currentRouter.name)) {
      router.push(currentRouter).catch(() => ({}))
    } else {
      router.push({ name: 'vault'}).catch(() => ({}))
    }
  } else if (isLocked) {
    if (!!store.state.isLoggedIn && accessToken && store.state.user.email && !!store.state.userPw) {
      if (to.meta?.isLock) {
        const isPwl = store.state.preloginData && (store.state.preloginData.require_passwordless || store.state.preloginData.login_method === 'passwordless')
        const isMpm = store.state.userPw && store.state.userPw.is_pwd_manager
        if (!isMpm && !isPwl && !['set-master-password'].includes(to.name)) {
          router.push({ name: "set-master-password" }).catch(() => ({}))
        } else {
          next()
        }
      } else {
        router.push({ name: "lock" }).catch(() => ({}))
      } 
    } else if (!['login', 'pwl-unlock', 'forgot-password'].includes(to.name)) {
      router.push({ name: "login" }).catch(() => ({}))
    } else {
      next();
    }
  } else if (!isLocked && !to.meta?.isAuth) {
    router.push({ name: "vault" }).catch(() => ({}))
  } else {
    next();
  }
  NProgress.done()
})
