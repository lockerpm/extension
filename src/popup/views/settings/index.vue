<template>
  <div>
    <div class="">
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
    </div>
    <div
      v-for="(cate, index) in menu"
      :key="index"
      :class="[cate.divided ? 'border-t border-black-400' : '']"
    >
      <p class="uppercase px-3">{{cate.name}}</p>
      <ul class="">
        <li
          v-for="(item, index) in cate.items"
          :key="index"
          class="flex items-center hover:bg-black-400 cursor-pointer h-[44px] leading-[44px] px-5"
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
  </div>
</template>

<script>
import Vue from 'vue'
import { BrowserApi } from '@/browser/browserApi';
export default Vue.extend({
  data () {
    return {
      menu: [
        // {
        //   icon: 'fa-home',
        //   routeName: 'settings-general',
        //   externalUrl: '',
        //   divided: false,
        //   name: 'general'
        // },
        // {
        //   icon: 'fa-home',
        //   routeName: 'settings-security',
        //   externalUrl: '',
        //   divided: false,
        //   name: 'security'
        // },
        // {
        //   icon: 'fa-home',
        //   routeName: 'settings-account',
        //   externalUrl: '',
        //   divided: false,
        //   name: 'account'
        // },
        // {
        //   icon: 'fa-home',
        //   routeName: 'settings-support',
        //   externalUrl: '',
        //   divided: true,
        //   name: 'support'
        // }
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
              externalUrl: '/web.html#/vault',
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
              name: 'Sync data Now'
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
      if (item.externalUrl) {
        this.$platformUtilsService.launchUri(item.externalUrl)
      }
      else if (item.lock){
        this.lock()
      } else {
        this.$router.push({name: item.routeName})
      }
    },
    async test () {
      const test = await BrowserApi.getTabFromCurrentWindow()
      console.log(test)
    }
  }
})
</script>
