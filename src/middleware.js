import router from './router/popup'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import JSLib from '@/popup/services/services'
import storePromise from '@/store'
const storageService = JSLib.getBgService('storageService')()
const vaultTimeoutService = JSLib.getBgService('vaultTimeoutService')()

let isFirst = true

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const middleware = () => {
  NProgress.configure({ showSpinner: false })
  router.beforeEach(async (to, from, next) => {
    NProgress.start()
    const store = await storePromise()
    const isLocked = await vaultTimeoutService.isLocked();
    const currentRouterString = await browserStorageService.get('current_router')
    const currentRouter = JSON.parse(currentRouterString)
    const allRouters = router.options.routes.map(o => o.children).flat();
    const isRouter = allRouters.find(r => currentRouter && r.name === currentRouter.name);
    if (to.meta?.isOver) {
      next();
    } else if (isFirst && isRouter) {
      if (currentRouter.name == to.name) {
        router.replace({ ...currentRouter }).catch(() => ({}))
      } else {
        router.push({ ...currentRouter }).catch(() => ({}))
      }
    } else if (isLocked) {
      if ((store.state.user.email && !!store.state.userPw) || store.state.preloginData?.email) {
        if (to.meta?.isLock) {
          const isPwl = store.state.preloginData && (store.state.preloginData.require_passwordless || store.state.preloginData.login_method === 'passwordless')
          const isMpm = (store.state.userPw && store.state.userPw.is_pwd_manager) || store.state.preloginData?.login_method === 'password'
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
    } else if (!isLocked && !to.meta?.isAuth && to.name !== "vault") {
      router.push({ name: "vault" }).catch(() => ({}))
    } else {
      next();
    }
    isFirst = false
    NProgress.done()
  })
}

export default middleware


