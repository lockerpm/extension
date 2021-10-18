import Vue from 'vue'
import VueRouter, {RouteConfig} from 'vue-router'
import Home from '../popup/views/home.vue'
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

export default router
