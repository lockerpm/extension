<template>
  <div
    class="w-full h-full"
  >
    <router-view v-if="isPortConnected"></router-view>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'BarApp',
  data () {
    return {
      isPortConnected: false,
    }
  },
  computed: {
  },
  async created () {
    self.addEventListener('message', async (event: any) => {
      if (event.target?.location.href === self.location.href) {
        if (event.data.isConnected) {
          this.isPortConnected = true;
          this.$store.commit('UPDATE_INIT_DATA', event.data.initData);
          const storeData = await this.$storageService.get('cs_store');
          if (storeData && storeData.language) {
            this.$i18n.locale = storeData.language || 'en'
          }
        }
      }
    })
  },
  methods: {
  }
})
</script>

<style lang="scss">
</style>
