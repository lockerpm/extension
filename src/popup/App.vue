<template>
  <div class="w-full">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ENDPOINT from '@/config/endpoint'

export default Vue.extend({
  name: 'App',
  data () {
    return {
      locked: true,
      ws1: null,
    }
  },
  asyncComputed: {
    locked: {
      async get () {
        return await this.$vaultTimeoutService.isLocked()
      },
      watch: []
    },
  },
  computed: {
    previousPath () {
      return this.$store.state.previousPath
    }
  },
  async created () {
    (self as any).bitwardenPopupMainMessageListener = async () => ({});
    const locked = await this.$vaultTimeoutService.isLocked();
    if (locked) {
      if (this.loginInfo.preloginData  && (this.loginInfo.preloginData.login_method === 'passwordless' || this.loginInfo.preloginData.require_passwordless)) {
        this.reconnectDesktopAppSocket(undefined, true);
      }
    }
  },
  async beforeMount () {
    const currentRouterString = await this.$storageService.get('current_router')
    const currentRouter = JSON.parse(currentRouterString)
    this.$router.push(currentRouter && currentRouter.name ? currentRouter : { name: 'vault'})
  },
  async mounted () {
    chrome.runtime.onMessage.addListener((msg) => {
      switch(msg.command){
      case 'locked':
        this.lock();
        break;
      case 'doneLoggingOut':
        this.logout();
        break;
      case 'loggedIn':
        if (this.$route.name === 'login') {
          (async () => {
            await this.$store.dispatch('LoadCurrentUser')
            this.$router.push({ name: 'lock' });
          })()
        }
        break;
      default:
        break;
      }
    });
  },
  watch: {
    '$store.state.userPw' (newValue) {
      if (newValue.is_pwd_manager === false) {
        this.$router.push({ name: 'set-master-password' })
      }
    },
    'locked' (newValue) {
      if (newValue) {
        this.$router.push({ name: 'lock' })
        this.disconnectSocket()
      } else {
        this.$store.dispatch('LoadTeams')
        this.getSyncData()
        this.reconnectSocket()
        this.$store.dispatch('LoadCurrentPlan')
      }
    },
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
  methods: {
    disconnectSocket () {
      if (this.ws1) {
        delete this.ws1.onmessage
        this.ws1.close()
      }
    },
    async reconnectSocket () {
      const cs_store = await this.$storageService.get('cs_store')
      const wsUrl = cs_store?.baseWsUrl || process.env.VUE_APP_WS_URL  
      const token = await this.$storageService.get('cs_token')
      this.$connect(this.sanitizeUrl(`${wsUrl}${ENDPOINT.CYSTACK_PLATFORM_SYNC}?token=${token}`), {
        format: 'json',
        reconnection: true,
        reconnectionAttempts: 60,
        reconnectionDelay: 3000
      })
      this.ws1 = this.$socket
      this.ws1.onmessage = message => {
        const data = JSON.parse(message.data)
        switch (data.event) {
        case 'sync':
          this.getSyncData()
          break
        default:
          break
        }
      }
    },
  }
})
</script>

<style lang="scss">
.vault-body {
  position: absolute !important;
  top: 137px !important;
  bottom: 40px !important;
  width: 100% !important;
  overflow: auto !important;
}
.settings-body {
  position: absolute !important;
  top: 73px !important;
  bottom: 0px !important;
  width: 100% !important;
  overflow: auto !important;
}
.show-body {
  position: absolute !important;
  top: 60px !important;
  bottom: 0px !important;
  width: 100% !important;
  overflow: auto !important;
}
.el-message-box {
  width: 260px !important;
}
</style>
