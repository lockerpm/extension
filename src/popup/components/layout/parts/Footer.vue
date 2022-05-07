<template>
  <!-- <div
    v-if="!locked && isLoggedIn && ['home', 'vault', 'settings', 'generator'].includes(this.$route.name)"
    id="popup-navigator"
    class="h-auto grid grid-cols-4 bg-white fixed bottom-0"
    style="z-index:1; width: 400px"
  >
    <router-link
      :to="{name: item.routeName}"
      v-for="item in menu"
      :key="item.routeName"
      class="text-center text-[16px] menu-item"
    >
      <div>
        <i :class="`fas fa-${item.icon}`"></i>
      </div>
      {{item.label}}
    </router-link>
  </div> -->
  <div
    v-if="!locked && isLoggedIn && ['home', 'vault', 'notes', 'identities', 'cards', 'folders'].includes(this.$route.name)"
    id="popup-navigator"
    class="h-10 bg-white fixed bottom-0 flex justify-between"
    style="z-index:1; width: 400px; padding: 12px 16px"
  >
    <a
      href="https://locker.io"
      target="_blank"
      class="font-semibold"
      style="color: #005AE4"
    >
      {{$t('data.parts.open_web_app')}}
    </a>
    <div
      class="cursor-pointer"
      @click="syncData"
    >
      <span>
        <i class="fas fa-sync-alt"></i>
      </span>
      {{$t('data.parts.sync_data')}}
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
export default Vue.extend({
  data () {
    return {
    }
  },
  asyncComputed: {
    async locked () {
      return await this.$vaultTimeoutService.isLocked()
    }
  },
  methods: {
    syncData () {
      this.getSyncData(true)
    }
  },
  computed: {
    menu () {
      return [
        {
          label: this.$t('data.parts.current'),
          routeName: 'home',
          // icon: 'popup_current.svg',
          icon: 'globe'
        },
        {
          label: this.$t('data.parts.vault'),
          routeName: 'vault',
          // icon: 'popup_vault.svg'
          icon: 'folder'
        },
        {
          label: this.$t('data.parts.generate'),
          routeName: 'generator',
          // icon: 'popup_generate.svg'
          icon: 'sync-alt'
        },
        {
          label: this.$t('data.parts.settings'),
          routeName: 'settings',
          // icon: 'popup_settings.svg'
          icon: 'cog'
        }
      ]
    }
  }
})
</script>

<style>
#popup-header input {
  background-color: #e4f0e6;
  height: 36px;
  border-radius: 42px;
  border: 0;
}
#popup-navigator .router-link-exact-active.router-link-active {
  color: #268334;
}

.menu-item {
  @apply hover:bg-[#F1F1F1] text-black-500;
  padding-top: 10px;
  padding-bottom: 5px;
}
a.menu-item {
  @apply hover:no-underline;
}
</style>
