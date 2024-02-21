<template>
  <div
    class="w-full h-full"
  >
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'MenuApp',
  data () {
    return {
      locked: true,
    }
  },
  computed: {
  },
  async created () {
    //
  },
  methods: {
  }
})
</script>

<style lang="scss">
</style>
