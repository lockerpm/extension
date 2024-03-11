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
  name: 'MenuApp',
  data () {
    return {
      isPortConnected: false,
    }
  },
  computed: {
  },
  async created () {
    self.addEventListener('message', (event: any) => {
      if (event.target?.location.href === self.location.href) {
        if (event.data.isConnected) {
          this.isPortConnected = true;
          this.$store.commit('UPDATE_INIT_DATA', event.data.initData)
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
