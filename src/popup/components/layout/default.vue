<template>
  <div
    class="relative mx-auto"
    style="background: #F6F6F6; min-height: 600px; max-width: 400px"
  >
    <Header></Header>
    <router-view v-if="wrapperType === 'component'" />
    <slot v-if="wrapperType === 'wrapper'"></slot>
    <Footer></Footer>
  </div>
</template>

<script>
import Vue from 'vue'
import { CipherType } from 'jslib-common/enums/cipherType';
import Header from "@/popup/components/layout/parts/Header";
import Footer from "@/popup/components/layout/parts/Footer";

import ENDPOINT from '@/config/endpoint'

export default Vue.extend({
  props: {
    wrapperType: {
      type: String,
      default: 'component'
    }
  },
  components: {
    Header,
    Footer
  },
  data () {
    return {
      locked: true,
      loading: false,
      lastActivity: null,
      idleTimer: null,
      isIdle: false,
      CipherType,
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
        // this.disconnectSocket()
      } else {
        this.$store.dispatch('LoadTeams')
        this.getSyncData()
        // this.reconnectSocket()
        this.$store.dispatch('LoadCurrentPlan')
      }
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
}
)
</script>
<style>
</style>
