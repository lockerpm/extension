<template>
  <div
    v-if="!locked && isLoggedIn && ['home', 'vault', 'settings', 'generator'].includes(this.$route.name)"
    id="popup-navigator"
    class="h-auto grid grid-cols-4 bg-white fixed bottom-0 left-0 right-0"
    style="z-index:1"
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
  </div>
</template>

<script>
import Vue from 'vue'
export default Vue.extend({
  data () {
    return {
      menu: [
        {
          label: 'Current',
          routeName: 'home',
          // icon: 'popup_current.svg',
          icon: 'globe'
        },
        {
          label: 'Vault',
          routeName: 'vault',
          // icon: 'popup_vault.svg'
          icon: 'folder'
        },
        {
          label: 'Generate',
          routeName: 'generator',
          // icon: 'popup_generate.svg'
          icon: 'sync-alt'
        },
        {
          label: 'Settings',
          routeName: 'settings',
          // icon: 'popup_settings.svg'
          icon: 'cog'
        }
      ]
    }
  },
  asyncComputed: {
    async locked () {
      return await this.$vaultTimeoutService.isLocked()
    }
  },
})
</script>

<style>
#popup-header input {
  height: 32px;
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
