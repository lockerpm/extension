<template>
  <div>
    <HelloWorld></HelloWorld>
    <router-view></router-view>
    <button class="btn btn-primary test"
            @click="openLogin"
    >Test</button>
    <button class="btn btn-primary test"
            @click="httpRequest"
    >Test HTTP</button>
    <button class="btn btn-primary test"
            @click="http404"
    >Test HTTP 404</button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import HelloWorld from '@/components/HelloWorld.vue'
export default Vue.extend({
  name: 'App',
  components: { HelloWorld },
  created() {
    this.initStore()
  },
  mounted() {
    console.log(this.$cipherService)
    console.log(this.$blogName )
  },
  methods: {
    async initStore () {
      const oldStore = await this.$storageService.get('cs-store')
      if (oldStore) {
        const oldStoreParsed = JSON.parse(oldStore)
        this.$store.commit('INIT_STORE', oldStoreParsed)
        console.log(oldStoreParsed)
      }
    },
    openLogin () {
      const url = `${process.env.VUE_APP_ID_URL}/login?SERVICE_URL=${encodeURIComponent('/sso')}&SERVICE_SCOPE=pwdmanager&CLIENT=browser`
      this.$platformUtilsService.launchUri(url)
    },
    httpRequest () {
      this.$http.get('/me')
        .then((response) => {
          console.log(response)
        })
    },
    http404 () {
      this.$http.get('/me/1')
        .then((response) => {
          console.log(response.data)
        })
    }
  }
})
</script>

<style>
html {
  width: 400px;
  height: 400px;
}
</style>
