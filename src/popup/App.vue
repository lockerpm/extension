<template>
  <div class="absolute w-full h-full z-[2001]">
    <div class="h-full">
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  name: 'App',
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
  }
})
</script>

<style>
</style>
