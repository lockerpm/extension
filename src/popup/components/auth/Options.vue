<template>
  <div class="w-full px-10">
    <div
      v-for="(option, i) in options"
      :key="i"
      class="login-option mb-4"
    >
      <el-button
        plain
        round
        class="w-full"
        type="primary"
        @click="handleLogin(option)"
      >{{ $t(`data.login.options.${option.title}`) }}</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {},
  data () {
    return {
      options: [
        {
          title: 'individual_vault',
          value: 'individual_vault',
        },
        {
          title: 'business_vault',
          value: 'business_vault',
        },
        {
          title: 'enterprise_vault',
          value: 'enterprise_vault',
        }
      ]
    }
  },
  methods: {
    handleLogin(option) {
      this.$emit('next');
    }
  }
})
</script>

<style scoped>
</style>
