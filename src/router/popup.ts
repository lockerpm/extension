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
          import("../popup/views/login.vue")
      },
      {
        path: "lock",
        name: "lock",
        component: () =>
          import("../popup/views/lock.vue")
      },
      {
        path: "pwl-unlock",
        name: "pwl-unlock",
        component: () =>
          import("../popup/views/pwl-unlock.vue")
      },
      {
        path: "forgot-password",
        name: "forgot-password",
        component: () =>
          import("../popup/views/forgot-password.vue")
      },
      {
        path: "set-master-password",
        name: "set-master-password",
        component: () =>
          import(
            "../popup/views/set-master-password.vue"
          )
      },
    ]
  },
  {
    path: "/",
    component: Layout,
    children: [
      {
        path: "home",
        name: "home",
        component: () =>
          import("../popup/views/home.vue")
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
          import("../popup/views/generator.vue")
      },
      {
        path: "otp",
        name: "otp",
        component: () =>
          import("../popup/views/otp.vue")
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
        path: "home/:id",
        name: "cipher-detail",
        component: () =>
          import(
            "../popup/views/cipher-detail.vue"
          )
      },
      {
        path: "add-edit-cipher",
        name: "add-edit-cipher",
        component: () =>
          import(
            "../popup/views/add-edit-cipher.vue"
          )
      },
      {
        path: "folders/:id",
        name: "folder-detail",
        component: () =>
          import(
            "../popup/views/folders/_id.vue"
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
