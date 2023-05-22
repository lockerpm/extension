<template>
  <div class="h-full">
    <div class="flex flex-col h-full">
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
    previousPath () {
      return this.$store.state.previousPath
    }
  },
  created () {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    (window as any).bitwardenPopupMainMessageListener = async () => {}
  },
  methods: {
  }
})
</script>

<style lang="scss">
.el-input {
  &__inner {
    border-radius: 8px !important;
  }
}
.el-button {
  border-radius: 8px
}
</style>
