<template>
  <div class="">
    <div v-if="!isLoggedIn" class="p-6">
      <img src="@/assets/images/logo/logo_black.svg" alt="Locker" class="h-[50px] mx-auto">
      <div class="my-5 text-center text-head-5">
        Log in or create a new account to access your secure vault.
      </div>
      <div class="w-full max-w-[500px]">
        <button class="btn btn-primary w-full mb-4"
                @click="openLogin"
        >
          Login
        </button>
        <button class="btn btn-default w-full mb-4"
                @click="openRegister"
        >
          Register
        </button>
        <button class="btn btn-default w-full mb-4"
                @click="openVault"
        >
          Vault
        </button>
      </div>
    </div>
    <div v-else>
      <div class="">
        <div class="flex items-center bg-black-300 cursor-pointer h-[44px] leading-[44px] px-5">
          <div class="menu-icon mr-4">
            <i class="fas fa-search text-[20px]"></i>
          </div>
          <div class="flex-grow">
            Search
          </div>
        </div>
      </div>
      <ul class="">
        <li
          class="flex items-center hover:bg-black-400 cursor-pointer h-[44px] leading-[44px] px-5 border-t border-black-400"
          @click="openVault">
          <div class="menu-icon mr-4">
            <i class="fas fa-home text-[20px]"></i>
          </div>
          <div class="flex-grow">
            Open my Vault
          </div>
        </li>
        <li class="flex items-center hover:bg-black-400 cursor-pointer h-[44px] leading-[44px] px-5"
            @click="openRoute({routeName: 'vault'})"
        >
          <div class="menu-icon mr-4">
            <i class="fas fa-home text-[20px]"></i>
          </div>
          <div class="flex-grow">
            All items
          </div>
          <div>
            <i class="fas fa-chevron-right"></i>
          </div>
        </li>
        <li class="flex items-center hover:bg-black-400 cursor-pointer h-[44px] leading-[44px] px-5 border-t border-black-400"
            @click="openRoute({routeName: 'add_item'})"
        >
          <div class="menu-icon mr-4">
            <i class="fas fa-plus-circle text-[20px]"></i>
          </div>
          <div class="flex-grow">
            Add item
          </div>
          <div>
            <i class="fas fa-chevron-right"></i>
          </div>
        </li>
        <li class="flex items-center hover:bg-black-400 cursor-pointer h-[44px] leading-[44px] px-5"
            @click="openRoute({routeName: 'generator'})"
        >
          <div class="menu-icon mr-4">
            <i class="fas fa-home text-[20px]"></i>
          </div>
          <div class="flex-grow">
            Generate secure password
          </div>
          <div>
            <i class="fas fa-chevron-right"></i>
          </div>
        </li>
        <li class="flex items-center hover:bg-black-400 cursor-pointer h-[44px] leading-[44px] px-5 border-t border-black-400"
          @click="openRoute({routeName: 'settings'})"
        >
          <div class="menu-icon mr-4">
            <i class="fas fa-home text-[20px]"></i>
          </div>
          <div class="flex-grow">
            Settings
          </div>
          <div>
            <i class="fas fa-chevron-right"></i>
          </div>
        </li>
        <li class="flex items-center hover:bg-black-400 cursor-pointer h-[44px] leading-[44px] px-5"
            @click="logout"
        >
          <div class="menu-icon mr-4">
            <i class="fas fa-sign-out-alt text-[20px]"></i>
          </div>
          <div class="flex-grow">
            Log Out
          </div>
          <div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { BrowserApi } from '@/browser/browserApi'
export default Vue.extend({
  name: 'Home',
  data () {
    return {
      step: 1
    }
  },
  methods: {
    openLogin () {
      const url = `${process.env.VUE_APP_ID_URL}/login?SERVICE_URL=${encodeURIComponent('/sso')}&SERVICE_SCOPE=pwdmanager&CLIENT=browser`

      this.$platformUtilsService.launchUri(url)
      BrowserApi.reloadOpenWindows();
      const thisWindow = window.open('', '_self');
      thisWindow.close();
    },
    openRegister () {
      const url = `${process.env.VUE_APP_ID_URL}/register?SERVICE_URL=${encodeURIComponent('/sso')}&SERVICE_SCOPE=pwdmanager&CLIENT=browser`
      this.$platformUtilsService.launchUri(url)
    },
    openVault () {
      this.$platformUtilsService.launchUri('/web.html#/vault')
    },
    openLock () {
      this.$router.push({name: 'lock'})
    },
    openSet () {
      this.$router.push({name: 'set-master-password'})
    },
    openRoute (item) {
      if (item.externalUrl) {
        this.$platformUtilsService.launchUri(item.externalUrl)
      } else {
        this.$router.push({name: item.routeName})
      }
    }
  }
});
</script>
