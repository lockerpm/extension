<template>
  <div
    class="flex items-start justify-between p-4"
    style="background-color: #F6F6F6;"
  >
    <div class="flex items-start">
      <img src="@/assets/images/icons/icon_menu_logo.svg">
      <div class="ml-2">
        <p class="font-semibold text-limited" :title="data.uri">{{ data.uri }}</p>
        <p>{{ data.id ? $t('bar.update_title') :  $t('bar.create_title') }}</p>
      </div>
    </div>
    <div
      class="font-bold cursor-pointer"
      @click="() => $emit('close')"
    >
      <i class="el-icon-close"></i>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  name: 'BarHeader',
  props: {
    data: {
      type: Object,
      default: () => ({})
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
