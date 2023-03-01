<template>
  <div class="fixed w-full h-full">
    <div class="flex items-center justify-center flex-grow flex-col mt-[-50px] h-[calc(100%+50px)] p-6">
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
          Web Vault
        </button>
        <!-- <button class="btn btn-default w-full mb-4"
                @click="openLock"
        >
          Lock
        </button>
        <button class="btn btn-default w-full mb-4"
                @click="openSet"
        >
          Set master
        </button> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { BrowserApi } from '@/browser/browserApi'

export default Vue.extend({
  name: 'HomeWeb',
  methods: {
    openLogin () {
      const msg = {
        command: 'authAccessToken',
        sender: { type: 'login'},
      };
      chrome.runtime.sendMessage(msg);
    },
    openRegister () {
      const msg = {
        command: 'authAccessToken',
        sender: { type: 'register'},
      };
      chrome.runtime.sendMessage(msg);
    },
    openVault () {
      this.$router.push({name: 'vault'})
    },
    openLock () {
      this.$router.push({name: 'lock'})
    },
    openSet () {
      this.$router.push({name: 'set-master-password'})
    },
  }
});
</script>
