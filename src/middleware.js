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
    if (store.state.userPw.is_pwd_manager === false && (!store.state.preloginData || !store.state.preloginData[0].require_passwordless)) {
      router.push({ name: "set-master-password" });
    } else {
      next();
    }
  } else if (to.name !== 'login') {
    router.push({ name: "login" });
  } else {
    next();
  }
  NProgress.done()
})
