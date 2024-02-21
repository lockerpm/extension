import Vue from 'vue'
import sentryConfig from './index'
import VueRouter, { RouteConfig } from 'vue-router'

import OtherLayout from '@/popup/layout/other.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: "/",
    component: OtherLayout,
    children: [
      {
        path: "",
        name: "bar",
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
  base: '/bar.html',
  routes
})

sentryConfig(router);
export default router
