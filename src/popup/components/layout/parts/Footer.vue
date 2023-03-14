<template>
  <div
    v-if="!locked && isLoggedIn && ['home', 'vault', 'notes', 'identities', 'cards', 'folders'].includes(this.$route.name)"
    id="popup-navigator"
    class="h-10 bg-white fixed bottom-0 flex justify-between"
    style="z-index:1; width: 400px; padding: 12px 16px"
  >
    <a
      href="https://locker.io/vault"
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
    locked: {
      async get () {
        return await this.$vaultTimeoutService.isLocked()
      },
      watch: []
    },
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
          icon: 'globe'
        },
        {
          label: this.$t('data.parts.vault'),
          routeName: 'vault',
          icon: 'folder'
        },
        {
          label: this.$t('data.parts.generate'),
          routeName: 'generator',
          icon: 'sync-alt'
        },
        {
          label: this.$t('data.parts.settings'),
          routeName: 'settings',
          icon: 'cog'
        }
      ]
    }
  }
})
</script>

<style>
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
