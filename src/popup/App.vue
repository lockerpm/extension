<template>
  <hello-world />
</template>

<script lang="ts">
import Vue from 'vue'
import HelloWorld from '@/components/HelloWorld.vue'

export default Vue.extend({
  name: 'App',
  components: { HelloWorld },
  mounted() {
    console.log(this.$cipherService)
    console.log(this.$blogName )
    setInterval(() => {
      console.log(this.$cipherService)
    },1000)
  }
})
</script>

<style>
html {
  width: 400px;
  height: 400px;
}
</style>
