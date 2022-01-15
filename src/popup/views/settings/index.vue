<template>
  <div
    class="relative"
    style="background: #F1F1F1; padding-bottom: 56px; padding-top: 44px; min-height: 600px; max-width: 400px"
  >
    <Header></Header>
    <div
      v-for="(cate, index) in menu"
      :key="index"
    >
      <p class="uppercase px-3 mt-4 mb-1 font-semibold">{{cate.name}}</p>
      <ul class="">
        <li
          v-for="(item, index) in cate.items"
          :key="index"
          class="flex items-center hover:bg-[#E4F2E1] bg-white cursor-pointer px-5 border-b border-black-400"
          :class="[item.divided ? 'border-t border-black-400' : '', item.picker ? 'h-auto leading-[32px]': 'h-[44px] leading-[44px]']"
          @click="openRoute(item)"
        >
          <template v-if="item.name==='Vault Timeout'">
            <div class="w-full py-2">
              <div>{{item.name}}</div>
              <el-select
              class="w-full"
              v-model="user.timeout"
              placeholder=""
              :disabled="loading"
              size="small"
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
          </template>
          <template v-else-if="item.name==='Vault Timeout Action'">
            <div class="w-full py-2">
              <div>{{item.name}}</div>
              <el-select
              class="w-full"
              v-model="user.timeout_action"
              placeholder=""
              :disabled="loading"
              @change="putUser"
              size="small"
            >
              <el-option
                v-for="item in vaultTimeoutActions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            </div>
          </template>
          <template v-else>
            <div class="flex-grow">
            {{  item.name  }}
          </div>
          <div>
            <i class="fas fa-chevron-right"></i>
          </div>
          </template>
        </li>
      </ul>
    </div>
    <Footer></Footer>
    <Fingerprint ref="fingerprintDialog"/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BrowserApi } from '@/browser/browserApi';
import Fingerprint from '@/popup/components/setting/Fingerprint.vue'
import Header from "@/popup/components/layout/parts/Header";
import Footer from "@/popup/components/layout/parts/Footer";
export default Vue.extend({
  components: {
    Fingerprint,
    Header,
    Footer
  },
  async mounted() {
    chrome.runtime.onMessage.addListener((msg: any, sender: chrome.runtime.MessageSender, response: any) => {
      this.processMessage(msg, sender, response);
    });
    this.getUser()
  },
  data () {
    return {
      user: {},
      loading: false,
      fingerprintDialog: false,
      menu: [
        {
          name: 'general',
          divided: false,
          items: [
            {
              icon: 'fa-home',
              routeName: '',
              externalUrl: '/web.html#/vault',
              name: 'Go to Web Vault'
            },
            {
              icon: 'fa-home',
              routeName: '',
              externalUrl: '/web.html#/settings/import-export',
              name: 'Import & Export'
            },
            {
              icon: 'fa-home',
              routeName: '',
              externalUrl: '/web.html#/settings/exclude-domains',
              name: 'Exclude domains'
            },
            // {
            //   icon: 'fa-home',
            //   routeName: 'settings-support',
            //   externalUrl: '',
            //   name: 'Theme (Light/Dark)'
            // }
          ]
        },
        {
          name: 'security',
          divided: true,
          items: [
            {
              icon: 'fa-home',
              routeName: '',
              externalUrl: '/web.html#/settings',
              name: 'Vault Timeout',
              picker: true
            },
            {
              icon: 'fa-home',
              routeName: '',
              externalUrl: '/web.html#/settings',
              name: 'Vault Timeout Action',
              picker: true
            },
            // {
            //   icon: 'fa-home',
            //   routeName: '',
            //   externalUrl: '/web.html#/settings/import-export',
            //   name: 'Two-step Login'
            // },
            {
              icon: 'fa-home',
              routeName: '',
              externalUrl: '/web.html#/settings/exclude-domains',
              action: 'fingerprint',
              name: 'Fingerprint Phrase'
            },
            {
              icon: 'fa-home',
              routeName: '',
              externalUrl: '',
              lock: true,
              name: 'Lock Now'
            }
          ]
        },
        {
          name: 'ACCOUNT',
          divided: true,
          items: [
            {
              icon: 'fa-home',
              routeName: '',
              externalUrl: '/web.html#/upgrade/',
              name: 'Upgrade to Premium'
            },
            {
              icon: 'fa-home',
              routeName: '',
              externalUrl: '/web.html#/settings?action=change-master-password',
              name: 'Change Master Password'
            },
            {
              icon: 'fa-home',
              routeName: '',
              externalUrl: '/web.html#/settings/',
              name: 'Manage your account'
            },
            {
              icon: 'fa-home',
              routeName: '',
              externalUrl: '/web.html#/settings/',
              action: 'sync_data',
              name: 'Sync data Now'
            },
            {
              icon: 'fa-home',
              routeName: '',
              externalUrl: '',
              logout: true,
              name: 'Log Out'
            }
          ]
        },
        {
          name: 'support',
          divided: true,
          items: [
            {
              icon: 'fa-home',
              routeName: '',
              externalUrl: '',
              name: 'About'
            },
            {
              icon: 'fa-home',
              routeName: '',
              externalUrl: '',
              name: 'Documentation'
            },
            {
              icon: 'fa-home',
              routeName: '',
              externalUrl: '',
              name: 'Help & Feedback'
            },
            {
              icon: 'fa-home',
              routeName: '',
              externalUrl: '',
              name: 'Rate the Extension'
            },
            {
              icon: 'fa-home',
              routeName: '',
              externalUrl: '',
              name: 'Contact us'
            }
          ]
        }
      ]
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
  },
  methods: {
    openRoute (item) {
      console.log(item.name)
      if (item.lock){
        this.lock()
      }
      else if(item.logout){
        this.logout()
      }
      else if(item.action){
        switch (item.action){
        case 'sync_data':
          this.getSyncData()
          break
        case 'fingerprint': 
          // this.fingerprintDialog = true
          this.openFingerprintDialog()
          break
        default:
          break
        }
      }
      else if (item.externalUrl) {
        this.$platformUtilsService.launchUri(item.externalUrl)
      }
      else {
        this.$router.push({name: item.routeName})
      }
    },
    async test () {
      const test = await BrowserApi.getTabFromCurrentWindow()
      console.log(test)
    },
    async processMessage(msg: any, sender: any, sendResponse: any) {
      switch (msg.command) {
      case 'syncCompleted':
        console.log('sync complete')
        if(this.$route.path === '/settings/' && msg.successfully){
          this.notify('Syncing complete', 'success')
        }
        break;
      default:
        break;
      }
    },
    openFingerprintDialog(){
      this.$refs.fingerprintDialog.openDialog()
    },
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
    }
  }
})
</script>
