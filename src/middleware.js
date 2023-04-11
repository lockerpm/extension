import router from './router/popup'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import storePromise from "./store";
import JSLib from '@/popup/services/services'
const browserStorageService = JSLib.getBgService('storageService')()
let isFirst = true

NProgress.configure({ showSpinner: false })

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  const store = await storePromise;
  const accessToken = await browserStorageService.get('cs_token')
  if (store.state.isLoggedIn === true && accessToken) {
    if (!store.state.user.email) {
      await store.dispatch("LoadCurrentUser");
      await store.dispatch("LoadCurrentUserPw");
    }
    if (store.state.user.email) {
      const isPwl = store.state.preloginData && (store.state.preloginData.require_passwordless || store.state.preloginData.login_method === 'passwordless')
      const isMpm = store.state.userPw && store.state.userPw.is_pwd_manager
      if (!isMpm && !isPwl) {
        if (to.name !== 'set-master-password') {
          router.push({ name: "set-master-password" });
        } else {
          next();
        }
      } else {
        if (['login', 'forgot-password'].includes(to.name)) {
          router.push({ name: "home" });
        } else {
          next();
        }
      }
    } else {
      if (!['login', 'pwl-unlock', 'forgot-password'].includes(to.name)) {
        router.push({ name: "login" });
      } else {
        next();
      }
    }
  } else if (!['login', 'pwl-unlock', 'forgot-password'].includes(to.name)) {
    if (!isFirst) {
      router.push({ name: "login" });
    }
    isFirst = false
  } else {
    next();
  }
  NProgress.done()
})
