<template>
  <div>
    <el-dialog
      :title="$t('data.settings.fingerprint_dialog')"
      :visible.sync="visible"
      width="90%"
      center
    >
      <span>{{fingerprint}}</span>
      <span slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          size="small"
          @click="visible = false"
        >
          {{$t('common.confirm')}}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
export default Vue.extend({
  data(){
    return {
      visible: false,
      fingerprint: ''
    }
  },
  methods: {
    async openDialog(){
      this.fingerprint = await this.getFingerprint()
      this.visible = true
    },
    async getFingerprint(){
      const fingerprint = await this.$cryptoService.getFingerprint(await this.$userService.getUserId())
      if (fingerprint != null) {
        return fingerprint.join('-')
      }
      return ''
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
