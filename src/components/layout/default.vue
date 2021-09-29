<template>
  <div class="tab-page">
    <template v-if="!locked">
      <Header />
      <div class="cs-content">
        <router-view />
      </div>
      <Footer />
    </template>
  </div>
</template>

<script>
import Vue from 'vue'
import Header from './parts/Header'
import Footer from './parts/Footer'
const BroadcasterSubscriptionId = 'AppComponent'
const IdleTimeout = 60000 * 10 // 10 minutes

export default Vue.extend({
  components: {
    Header, Footer
  },
  data () {
    return {
      externalContent: '',
      menu: [
        {
          label: 'all',
          routeName: 'vault',
          icon: 'all'
        },
        {
          label: 'passwords',
          routeName: 'passwords',
          icon: 'passwords'
        },
        {
          label: 'notes',
          routeName: 'notes',
          icon: 'notes'
        },
        {
          label: 'cards',
          routeName: 'cards',
          icon: 'cards'
        },
        {
          label: 'identities',
          routeName: 'identities',
          icon: 'identities'
        },
        {
          label: 'shares',
          routeName: 'shares',
          icon: 'shares'
        },
        {
          label: 'trash',
          routeName: 'trash',
          icon: 'trash'
        }
      ],
      locked: true,
      invitations: [],
      loading: false,
      lastActivity: null,
      idleTimer: null,
      isIdle: false,
      shouldWelcome: 'false'
    }
  },
  computed: {
    manageableTeams () {
      return this.teams.filter(e => ['owner', 'admin'].includes(e.role) && e.is_business)
    },
    bottomMenu () {
      return [
        ...this.currentPlan.alias === 'pm_free'
          ? [{
            label: 'upgrade',
            routeName: 'upgrade',
            icon: 'upgrade'
          }]
          : [],
        ...this.manageableTeams && this.manageableTeams.length
          ? [{
            label: 'dashboard',
            routeName: 'admin-teamId',
            icon: 'dashboard',
            params: { teamId: this.manageableTeams[0].id }
          }]
          : [],
        {
          label: 'settings',
          routeName: 'settings',
          icon: 'settings'
        },
        {
          label: 'tools',
          routeName: 'tools',
          icon: 'tools'
        }
      ]
    }
  },
  watch: {
    '$store.state.userPw' (newValue) {
      if (newValue.is_pwd_manager === false) {
        this.$router.push({ name: 'set-master-password' })
      }
    },
    'locked' (newValue) {
      if (newValue === true) {
        this.$router.push({ name: 'lock' })
        this.disconnectSocket()
      }
      if (newValue === false) {
        this.$store.dispatch('LoadTeams')
        this.getSyncData()
        this.getInvitations()
        this.reconnectSocket()
        this.$store.dispatch('LoadCurrentPlan')
      }
    }
  },
  mounted () {
    this.$broadcasterService.subscribe(BroadcasterSubscriptionId, async message => {
      switch (message.command) {
      case 'loggedIn':
        break
      case 'loggedOut':
      case 'unlocked':
        break
      case 'authBlocked':
      case 'logout':
        this.logout()
        break
      case 'lockVault':
        break
      case 'locked':
        this.lock()
        break
      case 'lockedUrl':
      case 'syncStarted':
      case 'syncCompleted':
      case 'upgradeOrganization':
      case 'premiumRequired':
      case 'emailVerificationRequired':
      case 'showToast':
      case 'setFullWidth':
      default:
        break
      }
    })
    this.init()
  },
  asyncComputed: {
    async locked () {
      return await this.$vaultTimeoutService.isLocked()
    }
  },
  beforeDestroy () {
    this.$broadcasterService.unsubscribe(BroadcasterSubscriptionId)
    this.removeEvent()
    this.disconnectSocket()
  },
  methods: {
    async getInvitations () {
      this.invitations = await this.axios.get('cystack_platform/pm/users/invitations')
    },
    async putInvitation (id, status) {
      try {
        this.loading = true
        await this.axios.put(`cystack_platform/pm/users/invitations/${id}`, {
          status
        })
        this.notify(this.$t(`data.notifications.${status}_member_success`), 'success')
        this.getInvitations()
      } catch (e) {
        this.notify(this.$t(`data.notifications.${status}_member_failed`), 'warning')
        console.log(e)
      } finally {
        this.loading = false
      }
    },
    async recordActivity () {
      const now = (new Date()).getTime()
      if (this.lastActivity != null && now - this.lastActivity < 250) {
        return
      }

      this.lastActivity = now
      this.$storageService.save('lastActive', now)

      if (this.isIdle) {
        this.isIdle = false
      }

      if (this.idleTimer != null) {
        clearTimeout(this.idleTimer)
        this.idleTimer = null
      }

      this.idleTimer = setTimeout(() => {
        if (!this.isIdle) {
          this.isIdle = true
        }
      }, IdleTimeout)
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    noop () {
    },
    idleStateChanged () {
      if (this.isIdle) {
        this.disconnectSocket()
      } else {
        this.reconnectSocket()
      }
    },
    init () {
      window.onmousemove = () => this.recordActivity()
      window.onmousedown = () => this.recordActivity()
      window.ontouchstart = () => this.recordActivity()
      window.onclick = () => this.recordActivity()
      window.onscroll = () => this.recordActivity()
      window.onkeypress = () => this.recordActivity()
      this.shouldWelcome = this.checkWelcome()
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
        case 'members':
          this.getInvitations()
          break
        default:
          break
        }
      }
    },
    disconnectSocket () {
      delete this.$options.sockets.onmessage
      this.$disconnect()
    },
    removeEvent () {
      window.onmousemove = () => this.noop()
      window.onmousedown = () => this.noop()
      window.ontouchstart = () => this.noop()
      window.onclick = () => this.noop()
      window.onscroll = () => this.noop()
      window.onkeypress = () => this.noop()
    },
    checkWelcome () {
      const deviceId = this.$cookies.get('device_id')
      return localStorage.getItem(`${deviceId}_welcome`)
    },
    offWelcome () {
      const deviceId = this.$cookies.get('device_id')
      localStorage.setItem(`${deviceId}_welcome`, 'false')
      this.shouldWelcome = 'false'
    },
    async test () {
      const data = await this.$vaultTimeoutService.isLocked()
      console.log(data)
    }
  }
}
)
</script>
