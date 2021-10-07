<template>
  <div>
    <div class="text-head-5 font-semibold mb-4">
      {{ $t('data.settings.account') }}
    </div>
    <div class="setting-wrapper">
      <div class="setting-section">
        <div class="setting-section-header">
          <div>
            <div class="setting-title">Email</div>
            <div class="setting-description">{{ currentUser.email }}</div>
          </div>
          <div>
            <button
              class="btn btn-default !text-warning"
              @click="lock"
            >
              {{ $t('common.lock') }}
            </button>
            <button
              class="btn btn-default !text-danger"
              @click="logout"
            >
              {{ $t('common.logout') }}
            </button>
          </div>
        </div>
      </div>
      <div class="setting-section">
        <div class="setting-section-header">
          <div>
            <div class="setting-title">{{ $t('data.settings.fingerprint') }}</div>
            <div class="setting-description !text-danger-400">{{ fingerprint }}</div>
          </div>
        </div>
      </div>
      <div class="setting-section">
        <div class="setting-section-header">
          <div>
            <div class="setting-title">{{ $t('data.settings.plan') }}</div>
            <div class="setting-description">{{ currentPlan.name }}</div>
          </div>
          <div>
            <router-link
              tag="button"
              :to="{name: 'upgrade'}"
              class="btn btn-primary"
            >
              {{ $t('data.settings.manage_plan') }}
            </router-link>
          </div>
        </div>
        <div class="setting-section-body">
          <div v-for="item in teams" :key="item.id" class="grid grid-cols-3 max-w-[800px] w-full justify-between">
            <div class="font-semibold truncate">{{ item.name }}</div>
            <div>
              {{ item.role === 'owner' ? $t('data.members.role.owner.title') : item.is_business ? $t(`data.members.role.${item.role}.title`) : $t('data.members.role.family.title') }}
            </div>
            <div>
              <router-link
                v-if="item.is_business && ['owner', 'admin'].includes(item.role)"
                :to="{name: 'admin-teamId', params: {teamId: item.id}}"
                class="text-primary cursor-pointer"
              >
                {{ $t('data.settings.manage') }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
      <div class="setting-section">
        <div class="setting-section-header">
          <div>
            <div class="setting-title">{{ $t('data.settings.language') }}</div>
          </div>
          <div>
            <el-select
              :value="language"
              placeholder="Select"
              @change="changeLang"
            >
              <el-option
                :label=" $t('data.settings.vietnamese')"
                value="vi"
              />
              <el-option
                :label=" $t('data.settings.english')"
                value="en"
              />
            </el-select>
          </div>
        </div>
      </div>
    </div>
    <div class="text-head-5 font-semibold mb-4">{{ $t('data.settings.options') }}</div>
    <div class="setting-wrapper">
      <div class="setting-section">
        <div class="setting-section-header">
          <div>
            <div class="setting-title">
              {{ $t('data.settings.timeout') }}
            </div>
            <div class="setting-description">
              {{ $t('data.settings.timeout_desc') }}
            </div>
          </div>
          <div>
            <el-select
              v-model="user.timeout"
              placeholder=""
              :disabled="loading"
              @change="putUser"
            >
              <el-option
                v-for="item in vaultTimeouts"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
      </div>
      <div class="setting-section">
        <div class="setting-section-header">
          <div>
            <div class="setting-title">
              {{ $t('data.settings.timeout_action') }}
            </div>
            <div class="setting-description">
              {{ $t('data.settings.timeout_action_1') }}
            </div>
            <div class="setting-description">
              {{ $t('data.settings.timeout_action_2') }}
            </div>
          </div>
          <div>
            <el-select
              v-model="user.timeout_action"
              placeholder=""
              :disabled="loading"
              @change="putUser"
            >
              <el-option
                v-for="item in vaultTimeoutActions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
      </div>
    </div>
    <div class="text-head-5 font-semibold mb-4">
      {{ $t('data.settings.security') }}
    </div>
    <div class="setting-wrapper">
      <div
        class="setting-section setting-section--hover"
        @click="changeMasterPassword"
      >
        <div class="setting-section-header">
          <div>
            <div class="setting-title">
              {{ $t('data.settings.change_master_password') }}
            </div>
          </div>
          <div>
            <button
              class="btn btn-icon !text-black-600"
            >
              <i class="fa fa-chevron-right" />
            </button>
          </div>
        </div>
      </div>
      <div class="setting-section setting-section--hover">
        <div class="setting-section-header">
          <div>
            <div class="setting-title">
              {{ $t('data.settings.emergency_access') }}
            </div>
            <div class="setting-description" />
          </div>
          <div>
            <button class="btn btn-icon !text-black-600">
              <i class="fa fa-chevron-right" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="text-head-5 font-semibold mb-4 text-danger">
      {{ $t('data.settings.danger_zone') }}
    </div>
    <div class="setting-wrapper">
      <div class="setting-section">
        <div class="setting-section-header">
          <div>
            <div class="setting-description mb-4">
              {{ $t('data.settings.danger_zone_note') }}
            </div>
            <div>
              <button
                class="btn btn-default !text-danger"
                @click="openDeauthorizeSessions()"
              >
                {{ $t('data.settings.deauthorize_sessions') }}
              </button>
              <button
                class="btn btn-default !text-danger"
                @click="openPurgeVault('purge')"
              >
                {{ $t('data.settings.delete_all_items') }}
              </button>
              <button
                class="btn btn-default !text-danger"
                @click="openPurgeVault('delete_account')"
              >
                {{ $t('data.settings.delete_account') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ChangeMasterPassword ref="changeMasterPassword" />
    <PurgeVault ref="purgeVault" />
    <DeauthorizeSessions ref="deauthorizeSessions" />
  </div>
</template>

<script>
import Vue from 'vue'
import ChangeMasterPassword from '@/components/user/ChangeMasterPassword'
import PurgeVault from '@/components/setting/PurgeVault'
import DeauthorizeSessions from '@/components/setting/DeauthorizeSessions'
export default Vue.extend({
  components: {
    ChangeMasterPassword, PurgeVault, DeauthorizeSessions
  },
  data () {
    return {
      user: {},
      loading: false,
      collapsed: false,
      fingerprint: ''
    }
  },
  computed: {
    vaultTimeouts () {
      return [
        { label: this.$t('data.timeouts.oneMinute'), value: 1 },
        { label: this.$t('data.timeouts.fiveMinutes'), value: 5 },
        { label: this.$t('data.timeouts.fifteenMinutes'), value: 15 },
        { label: this.$t('data.timeouts.thirtyMinutes'), value: 30 },
        { label: this.$t('data.timeouts.oneHour'), value: 60 },
        { label: this.$t('data.timeouts.fourHours'), value: 240 },
        { label: this.$t('data.timeouts.onRefresh'), value: -1 }
      ]
    },
    vaultTimeoutActions () {
      return [
        { label: this.$t('common.lock'), value: 'lock' },
        { label: this.$t('common.logout'), value: 'logOut' }
      ]
    },
    currentPlan () {
      return this.$store.state.currentPlan
    }
  },
  mounted () {
    this.getUser()
  },
  asyncComputed: {
    fingerprint: {
      async get () {
        const fingerprint = await this.$cryptoService.getFingerprint(await this.$userService.getUserId())
        if (fingerprint != null) {
          return fingerprint.join('-')
        }
        return ''
      },
      watch: ['$store.state.syncedCiphersToggle']
    }
  },
  methods: {
    async getUser () {
      const user = await this.$store.dispatch('LoadCurrentUserPw')
      this.user = { ...user }
    },
    async putUser () {
      try {
        this.loading = true
        await this.axios.put('cystack_platform/pm/users/me', this.user)
        this.$store.commit('UPDATE_USER_PW', this.user)
        this.$vaultTimeoutService.setVaultTimeoutOptions(this.user.timeout, this.user.timeout_action)
        this.notify(this.$t('data.notifications.update_settings_success'), 'success')
      } catch (e) {
        console.log(e)
        this.notify(this.$t('data.notifications.update_settings_failed'), 'warning')
      } finally {
        this.loading = false
      }
    },
    async upgradeTeam () {
      // default org
      const shareKey = await this.$cryptoService.makeShareKey()
      const orgKey = shareKey[0].encryptedString
      const collection = await this.$cryptoService.encrypt('defaultCollection' + this.currentUser.email, shareKey[1])
      const collectionName = collection.encryptedString
      this.axios.post('/cystack_platform/pm/teams', {
        name: this.currentUser.email + ' team',
        key: orgKey,
        collection_name: collectionName
      })
    },
    changeMasterPassword () {
      this.$refs.changeMasterPassword.openDialog()
    },
    openPurgeVault (type) {
      this.$refs.purgeVault.openDialog(type)
    },
    openDeauthorizeSessions () {
      this.$refs.deauthorizeSessions.openDialog()
    }
  }
})
</script>
