<template>
  <div>
    <router-view v-if="wrapperType === 'component'" />
    <slot v-if="wrapperType === 'wrapper'"></slot>
  </div>
</template>

<script>
import Vue from 'vue'
import { CipherType } from 'jslib-common/enums/cipherType';
export default Vue.extend({
  props: {
    wrapperType: {
      type: String,
      default: 'component'
    }
  },
  data () {
    return {
      locked: true,
      loading: false,
      lastActivity: null,
      idleTimer: null,
      isIdle: false,
      CipherType
    }
  },
  asyncComputed: {
    async locked () {
      return await this.$vaultTimeoutService.isLocked()
    }
  },
  watch: {
    '$store.state.userPw' (newValue) {
      if (newValue.is_pwd_manager === false) {
        this.$router.push({ name: 'set-master-password' })
      }
    },
    'locked' (newValue) {
      // console.log('locked: ', newValue)
      if (newValue === true) {
        this.$router.push({ name: 'lock' })
        this.disconnectSocket()
      }
      if (newValue === false) {
        this.$store.dispatch('LoadTeams')
        // console.log('unlock sync')
        this.getSyncData()
        this.reconnectSocket()
        this.$store.dispatch('LoadCurrentPlan')
      }
    }
  },
  methods: {
    disconnectSocket () {
      delete this.$options.sockets.onmessage
      this.$disconnect()
    },
    async reconnectSocket () {
      const token = await this.$storageService.get('cs_token')
      this.$connect(this.sanitizeUrl(`${process.env.VUE_APP_WS_URL}/cystack_platform/pm/sync?token=${token}`), {
        format: 'json',
        reconnection: true,
        reconnectionAttempts: 60,
        reconnectionDelay: 3000
      })
      this.$options.sockets.onmessage = message => {
        const data = JSON.parse(message.data)
        switch (data.event) {
        case 'sync':
          this.getSyncData()
          break
        default:
          break
        }
      }
    }
  }
}
)
</script>
<style>
</style>
