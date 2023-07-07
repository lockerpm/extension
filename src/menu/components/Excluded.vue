<template>
  <div class="p-4">
    <div class="text-center">
      <p class="mb-3">
        {{ $t('menu.domain_excluded_note') }}
      </p>
      <el-button
        type="primary"
        plain
        size="small"
        @click="$emit('turnOn')"
      >
        {{ $t('menu.turn_on') }}
      </el-button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
export default Vue.extend(
  {
    components: {
    },
    props: {
    },
    data(){
      return {
      }
    }
  }
)
</script>

<style lang="scss" scoped>
</style>
