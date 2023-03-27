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
  async created () {
    (window as any).bitwardenPopupMainMessageListener = async (msg: any, sender: any, sendResponse: any) => {
      console.log(msg)
      console.log(sender)
      console.log(sendResponse)
    }
    const locked = await this.vaultTimeoutService.isLocked()
    if (locked) {
      if (this.loginInfo.preloginData  && (this.loginInfo.preloginData.login_method === 'passwordless' || this.loginInfo.preloginData.require_passwordless)) {
        this.reconnectDesktopAppSocket(undefined, true);
      }
    }
  },
  async mounted () {
    const currrentRouter = await this.$storageService.get('currrent_router')
    this.$router.push({ name: JSON.parse(currrentRouter)?.name || 'home'})
  },
  watch: {
    '$route' (newValue) {
      this.$storageService.save('currrent_router', JSON.stringify(newValue))
    },
  },
  methods: {}
})
</script>

<style lang="scss">
.vault-body {
  position: absolute !important;
  top: 192px !important;
  bottom: 42px !important;
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
.el-input {
  &__inner {
    border-radius: 8px !important;
  }
}
.el-button {
  border-radius: 8px !important;
}
.el-message-box {
  width: 260px !important;
}
</style>
