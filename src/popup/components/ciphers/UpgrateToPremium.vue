<template>
  <el-dialog
    width="300px"
    destroy-on-close
    top="15vh"
    custom-class="upgrade-dialog"
    :visible="visible"
    :close-on-click-modal="false"
    @close="$emit('close')"
  >
    <div class="text-center">
      <p class="mb-6">
        <b>{{ $t('common.upgrade_des') }}</b>
      </p>
      <img
        class="w-full"
        :src="require('@/assets/images/popup/upgrade.svg')"
        alt=""
      >
      <el-button
        type="text"
        @click="upgradeNow()"
      >
        <a href="jvascript:;">{{ $t('common.upgrade_now') }}</a>
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue';

export default Vue.extend({
  components: {},
  props: {
    visible: Boolean
  },
  data () {
    return {
    }
  },
  methods: {
    upgradeNow () {
      this.$platformUtilsService.launchUri("https://locker.io/plans");
    }
  }
})
</script>
<style lang="scss">
.upgrade-dialog {
  background: #F0F2F6 !important;
  border-radius: 20px;
  .el-dialog__headerbtn {
    top: 10px !important;
    right: 12px !important;
  }
  .el-dialog__body {
    padding: 12px 32px;
  }
}
</style>
