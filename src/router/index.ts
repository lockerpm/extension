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
  {
    path: '/passwords',
    component: Layout,
    beforeEnter: VaultGuard,
    children: [
      {
        path: "",
        name: 'passwords',
        component: () => import(/* webpackChunkName: "passwords" */ '../views/passwords/index.vue')
      },
      {
        path: "/passwords/:id",
        name: 'passwords-id',
        component: () => import(/* webpackChunkName: "passwords" */ '../views/passwords/_id.vue')
      }
    ]
  },
  {
    path: '/notes',
    component: Layout,
    beforeEnter: VaultGuard,
    children: [
      {
        path: "",
        name: 'notes',
        component: () => import(/* webpackChunkName: "notes" */ '../views/notes/index.vue')
      },
      {
        path: "/notes/:id",
        name: 'notes-id',
        component: () => import(/* webpackChunkName: "notes" */ '../views/notes/_id.vue')
      }
    ]
  },
  {
    path: '/cards',
    component: Layout,
    beforeEnter: VaultGuard,
    children: [
      {
        path: "",
        name: 'cards',
        component: () => import(/* webpackChunkName: "cards" */ '../views/cards/index.vue')
      },
      {
        path: "/cards/:id",
        name: 'cards-id',
        component: () => import(/* webpackChunkName: "cards" */ '../views/cards/_id.vue')
      }
    ]
  },
  {
    path: '/identities',
    component: Layout,
    beforeEnter: VaultGuard,
    children: [
      {
        path: "",
        name: 'identities',
        component: () => import(/* webpackChunkName: "identities" */ '../views/identities/index.vue')
      },
      {
        path: "/identities/:id",
        name: 'identities-id',
        component: () => import(/* webpackChunkName: "identities" */ '../views/identities/_id.vue')
      }
    ]
  },
  {
    path: '/shares',
    component: Layout,
    beforeEnter: VaultGuard,
    children: [
      {
        path: "",
        name: 'shares',
        component: () => import(/* webpackChunkName: "shares" */ '../views/shares/index.vue')
      }
    ]
  },
  {
    path: '/trash',
    component: Layout,
    beforeEnter: VaultGuard,
    children: [
      {
        path: "",
        name: 'trash',
        component: () => import(/* webpackChunkName: "trash" */ '../views/trash/index.vue')
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
