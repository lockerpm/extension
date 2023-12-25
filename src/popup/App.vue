<template>
  <div
    class="w-full h-full"
  >
    <router-view />
  </div>
</template>

<script lang="js">
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
  async mounted () {
    this.locked = await this.$vaultTimeoutService.isLocked();
    if (!this.locked) {
      await this.$store.dispatch("LoadCurrentUserPw");
    }
    setInterval(async () => {
      this.locked = await this.$vaultTimeoutService.isLocked();
    }, 1000)
    self.service.on('serviceReady', async () => {
      this.$store.commit('UPDATE_IS_CONNECTED', true)
      await self.service.resetSocket()
    })
    self.service.on('serviceConnected', () => {
      this.$store.commit('UPDATE_IS_CONNECTED', true)
    })
    self.service.on('serviceDisconnected', () => {
      this.$store.commit('UPDATE_IS_CONNECTED', false)
    })
    self.service.on('desktopConnected', () => {
      this.$store.commit('UPDATE_IS_DESKTOP_CONNECTED', true)
    })
    self.service.on('desktopDisconnected', () => {
      this.$store.commit('UPDATE_IS_DESKTOP_CONNECTED', false)
    })
    self.service.on('pairingConfirmation', (data) => {
      this.$store.commit('UPDATE_APPROVE_CODE', data.approveCode)
      this.$store.commit('UPDATE_CLIENT_ID', data.clientId)
      this.$store.commit('UPDATE_CLIENT_TYPE', data.clientType)
      this.$store.commit('UPDATE_PAIRING_CONFIRMED', false)
    })
    self.service.on('pairingConfirmed', () => {
      this.$store.commit('UPDATE_PAIRING_CONFIRMED', true)
    })
    self.service.on('fidoRequestTouch', () => {
      this.$store.commit('UPDATE_IS_TOUCH', true)
    })
    self.service.on('fidoRequestFingerprint', () => {
      this.$store.commit('UPDATE_IS_FINGERPRINT', true)
    })
    self.service.on('userLogout', async (data) => {
      const userPw = this.$store.state.userPw;
      if (data.email === userPw?.email && userPw?.sync_all_platforms) {
        this.logout();
      }
    })
  },

  watch: {
    'locked' (newValue) {
      if (newValue) {
        this.disconnectSocket()
      } else {
        this.reconnectSocket()
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
      this.ws1.onmessage = async (message) => {
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
