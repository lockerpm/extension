<template>
  <div class="h-[600px]">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'App',
  data () {
    return {
    }
  },
  computed: {
    previousPath () {
      return this.$store.state.previousPath
    }
  },
  created () {
    (window as any).bitwardenPopupMainMessageListener = async (msg: any, sender: any, sendResponse: any) => {
      console.log(msg)
      console.log(sender)
      console.log(sendResponse)
    }
  },
  methods: {
  }
})
</script>

<style>
</style>
