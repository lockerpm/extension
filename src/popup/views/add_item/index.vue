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
          queryParam: 'folder',
          divided: true,
          name: 'Add Folder'
        },
        {
          icon: 'fa-home',
          queryParam: 'passwords',
          divided: false,
          name: 'Add Password'
        },
        {
          icon: 'fa-home',
          queryParam: 'notes',
          divided: false,
          name: 'Add Note'
        },
        {
          icon: 'fa-home',
          queryParam: 'card',
          divided: false,
          name: 'Add Card'
        },
        {
          icon: 'fa-home',
          queryParam: 'indentities',
          divided: true,
          name: 'Add Identity'
        }
      ]
    }
  },
  methods: {
    openRoute (item) {
      if (item.queryParam==='folder') {
        this.$platformUtilsService.launchUri(`/web.html#/vault?dialog=${item.queryParam}`)
      } else {
        this.$platformUtilsService.launchUri(`/web.html#/vault?add_item=${item.queryParam}`)
      }
    },
    async test () {
      const test = await BrowserApi.getTabFromCurrentWindow()
      console.log(test)
    }
  }
})
</script>
