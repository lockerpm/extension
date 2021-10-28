import Vue from 'vue'
import VueRouter, {RouteConfig} from 'vue-router'
import Home from '../popup/views/home.vue'
Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/vault',
    name: 'vault',
    component: () => import(/* webpackChunkName: "vault" */ '../popup/views/vault/index.vue')
  },
  {
    path: '/vault/passwords',
    name: 'vault-passwords',
    component: () => import(/* webpackChunkName: "vault" */ '../popup/views/vault/passwords.vue')
  },
  {
    path: '/vault/notes',
    name: 'vault-notes',
    component: () => import(/* webpackChunkName: "vault" */ '../popup/views/vault/notes.vue')
  },
  {
    path: '/vault/cards',
    name: 'vault-cards',
    component: () => import(/* webpackChunkName: "vault" */ '../popup/views/vault/cards.vue')
  },
  {
    path: '/vault/identities',
    name: 'vault-identities',
    component: () => import(/* webpackChunkName: "vault" */ '../popup/views/vault/identities.vue')
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: '/popup.html',
  routes
})

export default router
