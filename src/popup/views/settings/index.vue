<template>
  <div>
    <!-- <div class="">
      <div
        class="flex items-center bg-black-300 cursor-pointer h-[44px] leading-[44px] px-5"
        @click="$router.back()"
      >
        <div class="menu-icon mr-4">
          <i class="fas fa-chevron-left text-[20px]"></i>
        </div>
        <div class="flex-grow">
          Back
        </div>
      </div>
    </div> -->
    <div
      v-for="(cate, index) in menu"
      :key="index"
    >
      <p class="uppercase px-3 mt-4 mb-1">{{cate.name}}</p>
      <ul class="">
        <li
          v-for="(item, index) in cate.items"
          :key="index"
          class="flex items-center hover:bg-black-400 bg-white cursor-pointer h-[44px] leading-[44px] px-5 border-b border-black-400"
          :class="[item.divided ? 'border-t border-black-400' : '']"
          @click="openRoute(item)"
        >
          <div class="menu-icon mr-4">
            <i
              class="fas text-[20px]"
              :class="[item.icon]"
            ></i>
          </div>
          <div class="flex-grow">
            {{  item.name  }}
          </div>
          <div>
            <i class="fas fa-chevron-right"></i>
          </div>
        </li>
      </ul>
    </div>
    <!-- <el-dialog
      title="Your acccount's fingerprint phrase"
      :visible.sync="fingerprintDialog"
      width="80%"
      center
    >
      <span>{{fingerprint}}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="fingerprintDialog = false">Cancel</el-button>
        <el-button type="primary" @click="fingerprintDialog = false">Confirm</el-button>
      </span>
    </el-dialog> -->
    <Fingerprint ref="fingerprintDialog"/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BrowserApi } from '@/browser/browserApi';
import Fingerprint from '@/popup/components/setting/Fingerprint.vue'
export default Vue.extend({
  components: {
    Fingerprint
  },
  async mounted() {
    chrome.runtime.onMessage.addListener((msg: any, sender: chrome.runtime.MessageSender, response: any) => {
      this.processMessage(msg, sender, response);
    });
  },
  // asyncComputed: {
  //   fingerprint: {
  //     async get () {
  //       const fingerprint = await this.$cryptoService.getFingerprint(await this.$userService.getUserId())
  //       if (fingerprint != null) {
  //         return fingerprint.join('-')
  //       }
  //       return ''
  //     },
  //     watch: ['$store.state.syncedCiphersToggle']
  //   }
  // },
  data () {
    return {
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
              name: 'Vault Timeout'
            },
            {
              icon: 'fa-home',
              routeName: '',
              externalUrl: '/web.html#/settings/import-export',
              name: 'Two-step Login'
            },
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
    }
  }
})
</script>
