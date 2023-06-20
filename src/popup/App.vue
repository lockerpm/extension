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
    (window as any).bitwardenPopupMainMessageListener = async () => ({});
    const locked = await this.vaultTimeoutService.isLocked();
    if (locked) {
      if (this.loginInfo.preloginData  && (this.loginInfo.preloginData.login_method === 'passwordless' || this.loginInfo.preloginData.require_passwordless)) {
        this.reconnectDesktopAppSocket(undefined, true);
      }
    }
  },
  async beforeMount () {
    const currentRouterString = await this.$storageService.get('current_router')
    const currentRouter = JSON.parse(currentRouterString)
    this.$router.push(currentRouter && currentRouter.name ? currentRouter : { name: 'vault'}).catch(() => ({}))
  },
  async mounted () {
    chrome.runtime.onMessage.addListener(
      async (msg) => {
        switch(msg.command){
        case 'locked':
          this.$router.push({ name: 'lock' });
          break;
        case 'doneLoggingOut':
          this.$router.push({ name: 'login' });
          break;
        case 'loggedIn':
          if (this.$route.name === 'login') {
            await this.$store.dispatch('LoadCurrentUser')
            this.$router.push({ name: 'lock' });
          }
          break;
        default:
          break;
        }
      }
    );
  },
  watch: {
    $route: {
      async handler(newValue) {
        await this.$storageService.save('current_router', JSON.stringify({
          name: newValue.name,
          params: newValue.params,
          query: newValue.query
        }))
      },
      deep: true
    }
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
    border-radius: 4px !important;
  }
}
.el-button {
  border-radius: 4px !important;
}
.el-message-box {
  width: 260px !important;
}
</style>
