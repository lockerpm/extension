<template>
  <div class="flex flex-col sm:flex-row flex-1">
    <template v-if="!locked">
      <div class="w-60 h-screen bg-aside min-h-500px min-w-60 fixed">
        <div class="mt-10 px-8">
          <img
            class="h-[32px]"
            src="@/assets/images/logo/logo_white.svg"
          >
        </div>

        <nav class="mt-10">
          <router-link
            v-for="(item, index) in menu"
            :key="index"
            :to="{name: item.routeName, params: $route.params}"
            class="flex items-center py-2 px-6 hover:text-white hover:bg-white hover:bg-opacity-20 text-black-400 font-semibold hover:no-underline"
            active-class="bg-white bg-opacity-20 text-white"
            :exact="item.exact"
          >
            <span class="text-sm font-medium">{{ $t(`sidebar.${item.label}`) }}</span>
          </router-link>
        </nav>
      </div>
      <div class="pl-60 flex flex-col flex-row-fluid">
        <HeaderAdmin />
        <!-- <slot /> -->
        <router-view />
      </div>
    </template>
  </div>
</template>

<script>
import Vue from 'vue'
import HeaderAdmin from '../HeaderAdmin'
const BroadcasterSubscriptionId = 'AppComponent'

export default Vue.extend({
  components: {
    HeaderAdmin
  },
  middleware: ['LoggedIn', 'UserInfo', 'NotHaveAccountService'],
  data () {
    return {
      externalContent: '',
      menu: [
        {
          label: 'dashboard',
          routeName: 'admin-teamId',
          exact: true
        },
        {
          label: 'users',
          routeName: 'admin-teamId-users'
        },
        {
          label: 'groups',
          routeName: 'admin-teamId-groups'
        },
        {
          label: 'shared_folders',
          routeName: 'admin-teamId-shared-folders'
        },
        {
          label: 'policies',
          routeName: 'admin-teamId-policies'
        },
        {
          label: 'logs',
          routeName: 'admin-teamId-activity-logs'
        },
        {
          label: 'settings',
          routeName: 'admin-teamId-settings'
        }
      ],
      locked: true,
    }
  },
  watch: {
    '$store.state.userPw' (newValue) {
      if (newValue.is_pwd_manager === false) {
        this.$router.push(this.localeRoute({ name: 'set-master-password' }))
      }
    },
    'locked' (newValue) {
      if (newValue === true) {
        this.$router.push(this.localeRoute({ name: 'lock' }))
      }
      if (newValue === false) {
        this.getTeam()
        this.getSyncData()
      }
    },
    $route (to, from) {
      // react to route changes...
      if (from.params && to.params && from.params.teamId !== to.params.teamId) {
        this.getTeam()
      }
    }
  },
  asyncComputed: {
    async locked () {
      return await this.$vaultTimeoutService.isLocked(this.$store.state.isLoggedInPw)
    }
  },
  beforeDestroy () {
    this.$broadcasterService.unsubscribe(BroadcasterSubscriptionId)
  },
  methods: {
    async getTeam () {
      let shouldRedirect = false
      try {
        const team = await this.axios.get(`cystack_platform/pm/teams/${this.$route.params.teamId}`)
        shouldRedirect = ['member', 'manager'].includes(team.role) || !team.is_business
        this.$store.commit('UPDATE_TEAM', team)
      } catch (e) {
        shouldRedirect = false
      }
      if (shouldRedirect) {
        this.$store.commit('UPDATE_TEAM', {})
        this.$router.push(this.localeRoute({ name: 'vault' }))
      }
    }
  }
})
</script>
