<template>
  <div class="">
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
.vault-body {
  position: absolute !important;
  top: 180px !important;
  bottom: 56px !important;
  width: 100% !important;
  overflow: auto !important;
}
.settings-body {
  position: absolute !important;
  top: 98px !important;
  bottom: 0px !important;
  width: 100% !important;
  overflow: auto !important;
}
</style>
