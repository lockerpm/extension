<template>
  <div>
    <el-dialog
      title="Your acccount's fingerprint phrase"
      :visible.sync="dialogVisible"
      width="90%"
      center
    >
      <span>{{fingerprint}}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
export default Vue.extend({
  data(){
    return {
      dialogVisible: false,
      fingerprint: ''
    }
  },
  methods: {
    async openDialog(){
      this.fingerprint = await this.getFingerprint()
      this.dialogVisible = true
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
