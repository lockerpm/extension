import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import * as Sentry from "@sentry/vue";
import { BrowserTracing } from "@sentry/tracing";
import Home from '../views/home.vue'
Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'home',
    component: Home
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: '/popup.html',
  routes
})
// Sentry.init({
//   Vue,
//   dsn:
//     "https://ecff16ad29434021bf865bbf072d8a3d@o256038.ingest.sentry.io/6626151",
//   integrations: [
//     new BrowserTracing({
//       routingInstrumentation: Sentry.vueRouterInstrumentation(router)
//     })
//   ],
//   // Set tracesSampleRate to 1.0 to capture 100%
//   // of transactions for performance monitoring.
//   // We recommend adjusting this value in production
//   tracesSampleRate: 1.0
// });
export default router
