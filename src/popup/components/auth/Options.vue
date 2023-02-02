<template>
  <div class="w-full px-10">
    <div
      v-for="(group, index) in optionGroups"
      :key="index"
      class="mb-3"
    >
      <p
        v-if="group.title"
        class="login-option-title mb-2 text-xl text-gray-300"
      >
        {{ $t(`data.login.options.${group.title}`) }}
      </p>
      <div
        v-for="(option, i) in group.options"
        :key="i"
        class="login-option mb-2"
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    optionValue: String
  },
  data () {
    return {
      optionGroups: [
        {
          title: '',
          options: [
            {
              title: 'individual_vault',
              value: 'individual_vault',
            }
          ],
        },
        {
          title: '',
          options: [
            {
              title: 'business_vault',
              value: 'business_vault',
            },
          ],
        },
        {
          title: '',
          options: [
            {
              title: 'enterprise_vault',
              value: 'enterprise_vault',
            }
          ],
        }
      ]
    }
  },
  methods: {
    handleLogin(option) {
      this.$emit('change-option', option.value)
      this.$emit('next');
    }
  }
})
</script>

<style scoped>
</style>
