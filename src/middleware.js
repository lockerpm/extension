import router from './router/popup'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import storePromise from "./store";

NProgress.configure({ showSpinner: false })

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  const store = await storePromise;
  if (store.state.isLoggedIn === true) {
    if (!store.state.user.email) {
      await store.dispatch("LoadCurrentUser");
      await store.dispatch("LoadCurrentUserPw");
    }
    const isPwl = store.state.preloginData && store.state.preloginData.require_passwordless
    const isMpm = store.state.userPw && store.state.userPw.is_pwd_manager
    if (!isMpm && !isPwl) {
      if (to.name !== 'set-master-password') {
        router.push({ name: "set-master-password" });
      } else {
        next();
      }
    } else {
      next();
    }
  } else if (!['login', 'pwl-unlock', 'forgot-password'].includes(to.name)) {
    router.push({ name: "login" });
  } else {
    next();
  }
  NProgress.done()
})
