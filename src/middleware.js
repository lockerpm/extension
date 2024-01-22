import router from './router/popup'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import JSLib from '@/popup/services/services'
const browserStorageService = JSLib.getBgService('storageService')()
const vaultTimeoutService = JSLib.getBgService('vaultTimeoutService')()

let isFirst = true

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const middleware = () => {
  NProgress.configure({ showSpinner: false })
  router.beforeEach(async (to, from, next) => {
    NProgress.start()
    const isLocked = await vaultTimeoutService.isLocked();
    const currentRouterString = await browserStorageService.get('current_router')
    const currentRouter = JSON.parse(currentRouterString)
    const allRouters = router.options.routes.map(o => o.children).flat();
    const isRouter = allRouters.find(r => currentRouter && r.name === currentRouter.name)
    if (to.meta?.isOver) {
      next();
    } else if (isFirst && !!isRouter) {
      isFirst = false
      if (currentRouter.name == to.name) {
        router.replace({ ...currentRouter }).catch(() => ({}))
      } else {
        router.push({ ...currentRouter }).catch(() => ({}))
      }
    } else if (isLocked) {
      if (!['login'].includes(to.name)) {
        router.push({ name: "login" }).catch(() => ({}))
      } else {
        next();
      }
    } else if (!isLocked && !to.meta?.isAuth && to.name !== "vault") {
      router.push({ name: "vault" }).catch(() => ({}))
    } else {
      next();
    }
    NProgress.done()
  })
}

export default middleware


