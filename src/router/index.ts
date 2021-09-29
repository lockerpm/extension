import Vue from 'vue'
import VueRouter, {RouteConfig} from 'vue-router'
import Home from '../views/home.vue'
import storePromise from "../store";
import Layout from '@/components/layout/default.vue'
Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/authenticate',
    name: 'authenticate',
    component: () => import(/* webpackChunkName: "authenticate" */ '../views/authenticate.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "login" */ '../views/login.vue')
  },
  {
    path: '/set-master-password',
    name: 'set-master-password',
    component: () => import(/* webpackChunkName: "set-master-password" */ '../views/set-master-password.vue')
  },
  {
    path: '/lock',
    name: 'lock',
    component: () => import(/* webpackChunkName: "lock" */ '../views/lock.vue')
  },
  {
    path: '/vault',
    component: Layout,
    beforeEnter: VaultGuard,
    children: [
      {
        path: "",
        name: 'vault',
        component: () => import(/* webpackChunkName: "vault" */ '../views/vault/index.vue')
      }
    ]
  },
]

const router = new VueRouter({
  mode: 'hash',
  base: '/popup.html',
  routes
})

async function VaultGuard (to, from, next) {
  const store = await storePromise
  if (store.state.isLoggedIn === true) {
    await store.dispatch('LoadCurrentUser')
    await store.dispatch('LoadCurrentUserPw')
    if (store.state.userPw.is_pwd_manager === false) {
      console.log('Dieu huong set-master-password')
      next({name: 'set-master-password'});
    } else {
      console.log('Dieu huong binh thuong')
      next();
    }
  } else {
    console.log('Dieu huong Login')
    next({name: 'login'});
  }
  next();
}

export default router
