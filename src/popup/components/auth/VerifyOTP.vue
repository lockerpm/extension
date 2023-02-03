<template>
  <div class="w-full px-10">
    <el-form :model="form">
      <p class="mt-0">{{ identity === 'email' ? $t('data.login.check_email') : $t('data.login.use_authentication_app') }}</p>
      <el-form-item
        prop="otpCode"
        :label="$t('data.login.enter_code_here')"
      >
        <el-input
          v-model="form.otpCode"
          :placeholder="$t('data.login.enter_code')"
        ></el-input>
      </el-form-item>
      <el-form-item
        prop="saveDevice"
      >
        <el-checkbox v-model="form.saveDevice">
          {{ $t('data.login.remember_device') }}
        </el-checkbox>
      </el-form-item>
    </el-form>
    <el-row type="flex" align="middle" justify="space-between">
      <el-button
      type="text"
      icon="el-icon-back"
      @click="$emit('back')"
    >{{ $t(`common.back`) }}</el-button>
      <el-button
      type="primary"
    >{{ $t(`data.login.authenticate`) }}</el-button>
    </el-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    identity: String
  },
  data () {
    return {
      form: {
        otpCode: '',
        saveDevice: false,
      }
    }
  },
  methods: {
  }
})
</script>

<style scoped>
</style>
