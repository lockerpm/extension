<template>
  <div class="flex flex-col sm:flex-row flex-1">
    <template v-if="!locked">
      <div class="locker-sidebar">
        <div class="w-60 h-screen bg-aside min-h-500px min-w-60 fixed flex flex-col justify-between">
        <div>
          <div class="mt-7 px-6">
            <img class="h-[32px]" src="@/assets/images/logo/logo_white.svg" alt="Logo">
          </div>
          <nav class="mt-7">
            <router-link
              v-for="(item, index) in menu"
              :key="index"
              :to="{name: item.routeName}"
              class="flex items-center py-2 px-6 hover:text-white hover:bg-white hover:bg-opacity-20 text-black-400 font-semibold hover:no-underline"
              active-class="bg-white bg-opacity-20 text-white"
            >
              <div class="mr-2 w-[22px] h-[22px] flex items-center">
                <img :src="require(`@/assets/images/icons/${item.icon}.svg`)" alt="">
              </div>
              <span class="text-sm font-medium">{{ $t(`sidebar.${item.label}`) }}</span>
            </router-link>
          </nav>
        </div>
        <div>
          <nav class="mb-10">
            <router-link
              v-for="(item, index) in bottomMenu"
              :key="index"
              :to="{name: item.routeName, params: item.params}"
              class="flex items-center py-2 px-6 hover:text-white hover:bg-white hover:bg-opacity-20 text-black-400 font-semibold hover:no-underline"
              active-class="bg-white bg-opacity-20 text-white"
            >
              <div class="mr-2 w-[22px] h-[22px] flex items-center">
                <img :src="require(`@/assets/images/icons/${item.icon}.svg`)" alt="">
              </div>
              <span class="text-sm font-medium">{{ $t(`sidebar.${item.label}`) }}</span>
            </router-link>
          </nav>
        </div>
      </div>
      </div>
      <div class="vault-container flex flex-col flex-row-fluid">
        <Header />
        <div v-if="shouldWelcome !=='false'" class="flex-column-fluid lg:px-28 py-10 px-10">
          <div class="border border-black-200 rounded p-5 md:p-8 relative">
            <div class="flex items-center justify-between">
              <div class="">
                <div class="text-lg font-semibold mb-2">
                  Chào mừng bạn đến với CyStack Locker
                </div>
                <div class="text-black-600 mb-5">
                  Bạn có thể lưu trữ mật khẩu, ghi chú, hồ sơ để mua sắm trực tuyến và thậm chí cả tài liệu một cách an toàn.
                  <br>
                  Và bất kể bạn làm việc ở đâu, kho tiền của bạn luôn đồng bộ hóa mọi thứ, vì vậy bạn có thể luôn ngăn nắp và tiết kiệm thời gian.
                </div>
              </div>
              <div>
                <img src="@/assets/images/icons/welcome.svg" alt="">
              </div>
              <button
                class="btn btn-clean absolute top-2 -right-2"
                @click="offWelcome"
              >
                <i class="el-icon-close text-lg" />
              </button>
            </div>
          </div>
        </div>
        <div v-if="invitations.length" class="flex-column-fluid lg:px-28 py-10 px-10">
          <div
            v-for="invitation in invitations.slice(0, 1)"
            :key="invitation.id"
            class="banner-invitation border border-black-200 rounded p-5 md:p-8"
          >
            <div class="flex items-center justify-between">
              <div class="">
                <div class="text-lg font-semibold mb-2">
                  Invitation to join {{ invitation.team && invitation.team.name }}
                </div>
                <div class="text-black-600 mb-5">
                  You’ve been invited to the {{ invitation.team && invitation.team.name }} organization! Join now and start collaborating with your teammates.
                </div>
                <div>
                  <button
                    class="btn btn-default"
                    :disabled="loading"
                    @click="putInvitation(invitation.id, 'reject')"
                  >
                    Từ chối
                  </button>
                  <button
                    class="btn btn-primary"
                    :disabled="loading"
                    @click="putInvitation(invitation.id, 'accept')"
                  >
                    Đồng ý
                  </button>
                </div>
              </div>
              <div>
                <img src="@/assets/images/icons/invitation.svg" alt="">
              </div>
            </div>
          </div>
        </div>
        <router-view v-if="wrapperType === 'component'" />
        <slot v-if="wrapperType === 'wrapper'"></slot>
      </div>
    </template>
  </div>
</template>

<script>
import Vue from 'vue'
import Header from './parts/Header'
const BroadcasterSubscriptionId = 'AppComponent'
const IdleTimeout = 60000 * 10 // 10 minutes

export default Vue.extend({
  components: {
    Header
  },
  props: {
    wrapperType: {
      type: String,
      default: 'component'
    }
  },
  data () {
    return {
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
  created () {
    if(this.$route.query.source === 'id.locker.io'){
      this.notify('Locker has been logged in. Now you can use Locker extension by clicking the icon from toolbar', 'success')
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
    locked: {
      async get () {
        return await this.$vaultTimeoutService.isLocked()
      },
      watch: []
    },
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
      const deviceId = 1 || this.$cookies.get('device_id')
      return localStorage.getItem(`${deviceId}_welcome`)
    },
    offWelcome () {
      const deviceId = 1 || this.$cookies.get('device_id')
      localStorage.setItem(`${deviceId}_welcome`, 'false')
      this.shouldWelcome = 'false'
    },
    async test () {
      await this.$vaultTimeoutService.isLocked()
    }
  }
}
)
</script>
<style scoped>
.locker-sidebar{
  display: block;
}
.vault-container{
  @apply pl-60
}
@media screen and (max-width: 768px)  {
  .locker-sidebar{
    display: none;
  }
  .vault-container{
    padding-left: 0px;
  }
}
</style>
