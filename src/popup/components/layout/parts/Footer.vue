<template>
  <div
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
