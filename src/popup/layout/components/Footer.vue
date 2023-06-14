<template>
  <div
    id="layout-footer"
    class="h-10 bg-white fixed bottom-0 flex items-center justify-between w-full px-4"
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
  }
})
</script>

<style>
</style>
