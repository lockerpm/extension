<template>
  <div
    class="bar-footer flex items-center justify-end"
  >
    <el-button
      v-if="!data.id"
      size="small"
      type="warning"
      class="mr-2"
      :disabled="callingAPI"
      @click="() => $emit('exclude')"
    >
      {{ $t('common.never') }}
    </el-button>
    <el-button
      size="small"
      type="primary"
      :loading="callingAPI"
      @click="() => $emit('save')"
    >
      {{ $t('common.save') }}
    </el-button>
  </div>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'BarFooter',
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    callingAPI: {
      type: Boolean,
      default: false
    }
  },
  computed: {
  },
  methods: {
  }
})
</script>

<style lang="scss">
</style>
