<template>
  <div
    class="w-full h-full"
  >
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
  computed: {
    previousPath () {
      return this.$store.state.previousPath
    }
  },
  async created () {
    this.locked = await this.$vaultTimeoutService.isLocked();
    setInterval(async () => {
      this.locked = await this.$vaultTimeoutService.isLocked();
    }, 1000)
    if (this.locked) {
      if (this.loginInfo.preloginData  && (this.loginInfo.preloginData.login_method === 'passwordless' || this.loginInfo.preloginData.require_passwordless)) {
        this.reconnectDesktopAppSocket(undefined, true);
      }
    }
  },

  watch: {
    'locked' (newValue) {
      if (newValue) {
        this.disconnectSocket()
      } else {
        this.$store.dispatch('LoadTeams')
        this.$store.dispatch('LoadCurrentPlan')
      }
    },
    $route: {
      async handler(newValue) {
        if (newValue.meta?.isOver) {
          return
        }
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
      this.ws1.onmessage = async (message: any) => {
        const data = JSON.parse(message.data)
        switch (data.event) {
        case 'sync':
          await this.$syncService.syncWsData(data);
          this.$store.commit("UPDATE_SYNCED_CIPHERS");
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
.el-message-box {
  width: 260px !important;
}
</style>
