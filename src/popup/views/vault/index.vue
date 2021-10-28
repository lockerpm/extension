<template>
  <div>
    <div class="">
      <div class="flex items-center bg-black-300 cursor-pointer h-[44px] leading-[44px] px-5"
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
    <button class="btn btn-primary" @click="test">Test</button>
    <ul class="">
      <li v-for="(item, index) in menu" :key="index"
        class="flex items-center hover:bg-black-400 cursor-pointer h-[44px] leading-[44px] px-5" :class="[item.divided ? 'border-t border-black-400' : '']"
          @click="openRoute(item)"
      >
        <div class="menu-icon mr-4">
          <i class="fas text-[20px]" :class="[item.icon]"></i>
        </div>
        <div class="flex-grow">
          {{  item.name  }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import Vue from 'vue'
import { BrowserApi } from '@/browser/browserApi';
export default Vue.extend({
  data () {
    return {
      menu: [
        {
          icon: 'fa-home',
          routeName: 'vault-passwords',
          externalUrl: '',
          divided: false,
          name: 'passwords'
        },
        {
          icon: 'fa-home',
          routeName: 'vault-notes',
          externalUrl: '',
          divided: false,
          name: 'notes'
        },
        {
          icon: 'fa-home',
          routeName: 'vault-cards',
          externalUrl: '',
          divided: false,
          name: 'cards'
        },
        {
          icon: 'fa-home',
          routeName: 'vault-identities',
          externalUrl: '',
          divided: true,
          name: 'identities'
        }
      ]
    }
  },
  methods: {
    openRoute (item) {
      if (item.externalUrl) {
        this.$platformUtilsService.launchUri(item.externalUrl)
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
