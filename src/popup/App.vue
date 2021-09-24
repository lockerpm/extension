<template>
  <div>
    <HelloWorld></HelloWorld>
    <router-view></router-view>
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
