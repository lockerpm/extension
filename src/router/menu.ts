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
];

const router = new VueRouter({
  mode: 'hash',
  base: '/menu.html',
  routes
})

sentryConfig(router);
export default router
