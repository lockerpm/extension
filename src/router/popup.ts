import Vue from 'vue'
import sentryConfig from './index'
import VueRouter, { RouteConfig } from 'vue-router'

import Layout from '@/popup/layout/index.vue'
import AuthLayout from '@/popup/layout/auth.vue'
import ShowLayout from '@/popup/layout/show.vue'
import OtherLayout from '@/popup/layout/other.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: "/auth",
    component: AuthLayout,
    children: [
      {
        path: "login",
        name: "login",
        component: () =>
          import("../popup/views/auth/login.vue")
      },
      {
        path: "forgot-password",
        name: "forgot-password",
        component: () =>
          import("../popup/views/auth/forgot-password.vue")
      },
      {
        path: "lock",
        name: "lock",
        meta: {
          isLock: true
        },
        component: () =>
          import("../popup/views/auth/lock.vue")
      },
      {
        path: "pwl-unlock",
        name: "pwl-unlock",
        meta: {
          isLock: true
        },
        component: () =>
          import("../popup/views/auth/pwl-unlock.vue")
      },
      {
        path: "set-master-password",
        name: "set-master-password",
        meta: {
          isLock: true
        },
        component: () =>
          import(
            "../popup/views/auth/set-master-password.vue"
          )
      },
    ]
  },
  {
    path: "/",
    component: Layout,
    children: [
      {
        path: "",
        name: "vault",
        meta: {
          isAuth: true
        },
        component: () =>
          import("../popup/views/vault/index.vue")
      },
      {
        path: "folders",
        name: "folders",
        meta: {
          isAuth: true
        },
        component: () =>
          import(
            "../popup/views/folders/index.vue"
          )
      },
      {
        path: "generator",
        name: "generator",
        meta: {
          isAuth: true
        },
        component: () =>
          import("../popup/views/generator/index.vue")
      },
      {
        path: "otp",
        name: "otp",
        meta: {
          isAuth: true
        },
        component: () =>
          import("../popup/views/otp/index.vue")
      },
      {
        path: "settings",
        name: "settings",
        meta: {
          isAuth: true
        },
        component: () =>
          import(
            "../popup/views/settings/index.vue"
          )
      },
    ]
  },
  {
    path: "/",
    component: ShowLayout,
    children: [
      {
        path: "vault/:id",
        name: "vault-detail",
        meta: {
          isAuth: true
        },
        component: () =>
          import(
            "../popup/views/vault/detail.vue"
          )
      },
      {
        path: "folders/:id",
        name: "folder-detail",
        meta: {
          isAuth: true
        },
        component: () =>
          import(
            "../popup/views/folders/detail.vue"
          )
      },
      {
        path: "vault/add-edit",
        name: "add-edit-cipher",
        meta: {
          isAuth: true
        },
        component: () =>
          import(
            "../popup/views/vault/show.vue"
          )
      },
      {
        path: "settings/excluded-domains",
        name: "settings-excluded-domains",
        meta: {
          isAuth: true
        },
        component: () =>
          import(
            "../popup/views/settings/excluded-domains.vue"
          )
      },
      {
        path: "settings/vault-timeout",
        name: "settings-vault-timeout",
        meta: {
          isAuth: true
        },
        component: () =>
          import(
            "../popup/views/settings/vault-timeout.vue"
          )
      },
      {
        path: "settings/info",
        name: "settings-info",
        meta: {
          isAuth: true
        },
        component: () =>
          import(
            "../popup/views/settings/info.vue"
          )
      }
    ]
  },
  {
    path: "/menu",
    component: OtherLayout,
    children: [
      {
        path: "",
        name: "menu",
        meta: {
          isOver: true
        },
        component: () =>
          import(
            "../menu/index.vue"
          )
      },
    ]
  },
  {
    path: "/bar",
    component: OtherLayout,
    children: [
      {
        path: "",
        name: "bar",
        meta: {
          isOver: true
        },
        component: () =>
          import(
            "../bar/index.vue"
          )
      },
    ]
  },
];

const router = new VueRouter({
  mode: 'hash',
  base: '/popup.html',
  routes
})

sentryConfig(router);
export default router
