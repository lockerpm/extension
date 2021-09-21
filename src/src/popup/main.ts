import Vue from 'vue'
import App from './App.vue'
import router from '../router'
import store from '../store'
import JSLib from './services/services.module'
Vue.config.productionTip = false
Vue.use(JSLib)
Vue.prototype.$blogName = 'LogRocket'

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
