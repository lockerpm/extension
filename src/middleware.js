import router from './router/popup'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import storePromise from "./store";
import JSLib from "@/popup/services/services";
const browserStorageService = JSLib.getBgService('storageService')()

let fistData = true;

NProgress.configure({ showSpinner: false })

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  const store = await storePromise;
  const accessToken = await browserStorageService.get('cs_token')
  if (!!store.state.isLoggedIn && accessToken) {
    if (fistData) {
      await store.dispatch("LoadCurrentUser");
      await store.dispatch("LoadCurrentUserPw");
      fistData = false
    }
    if (store.state.user.email && !!store.state.userPw) {
      if (!store.state.userPw.is_pwd_manager && !['set-master-password'].includes(to.name)) {
        router.push({ name: "set-master-password" });
      } else {
        if (to.name === 'login') {
          router.push({ name: "home" });
        } else {
          next();
        }
      }
    } else {
      if (!['login'].includes(to.name)) {
        router.push({ name: "login" });
      } else {
        next();
      }
    }
  } else if (to.name !== 'login') {
    router.push({ name: "login" });
  } else {
    next();
  }
  NProgress.done()
})
