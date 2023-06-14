import Vue from 'vue'
import sentryConfig from './index'
import VueRouter, { RouteConfig } from 'vue-router'

import Layout from '@/popup/layout/index.vue'
import ShowLayout from '@/popup/layout/show.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: "/auth",
    children: [
      {
        path: "login",
        name: "login",
        component: () =>
          import("../popup/views/auth/login.vue")
      },
      {
        path: "lock",
        name: "lock",
        component: () =>
          import("../popup/views/auth/lock.vue")
      },
      {
        path: "pwl-unlock",
        name: "pwl-unlock",
        component: () =>
          import("../popup/views/auth/pwl-unlock.vue")
      },
      {
        path: "forgot-password",
        name: "forgot-password",
        component: () =>
          import("../popup/views/auth/forgot-password.vue")
      },
      {
        path: "set-master-password",
        name: "set-master-password",
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
        path: "vault",
        name: "vault",
        component: () =>
          import("../popup/views/vault/index.vue")
      },
      {
        path: "folders",
        name: "folders",
        component: () =>
          import(
            "../popup/views/folders/index.vue"
          )
      },
      {
        path: "generator",
        name: "generator",
        component: () =>
          import("../popup/views/generator/index.vue")
      },
      {
        path: "otp",
        name: "otp",
        component: () =>
          import("../popup/views/otp/index.vue")
      },
      {
        path: "settings",
        name: "settings",
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
        component: () =>
          import(
            "../popup/views/vault/detail.vue"
          )
      },
      {
        path: "folders/:id",
        name: "folder-detail",
        component: () =>
          import(
            "../popup/views/folders/detail.vue"
          )
      },
      {
        path: "vault/add-edit",
        name: "add-edit-cipher",
        component: () =>
          import(
            "../popup/views/vault/show.vue"
          )
      },
      {
        path: "otp/add-edit",
        name: "add-edit-otp",
        component: () =>
          import(
            "../popup/views/otp/show.vue"
          )
      },
      {
        path: "settings/excluded-domains",
        name: "settings-excluded-domains",
        component: () =>
          import(
            "../popup/views/settings/excluded-domains.vue"
          )
      },
      {
        path: "settings/vault-timeout",
        name: "settings-vault-timeout",
        component: () =>
          import(
            "../popup/views/settings/vault-timeout.vue"
          )
      },
      {
        path: "settings/info",
        name: "settings-info",
        component: () =>
          import(
            "../popup/views/settings/info.vue"
          )
      }
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
