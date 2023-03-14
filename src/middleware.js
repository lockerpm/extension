import router from './router/popup'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import storePromise from "./store";
import i18n from './locales/i18n';

NProgress.configure({ showSpinner: false })

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  const store = await storePromise;
  if (store.state.isLoggedIn === true) {
    if (!store.state.user.email) {
      const res = await store.dispatch("LoadCurrentUser");
      i18n.locale = res.language
      await store.dispatch("LoadCurrentUserPw");
    }
    if (store.state.userPw.is_pwd_manager === false) {
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
