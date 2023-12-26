<template>
  <div class="w-full px-10">
    <el-form :model="form" @submit.native.prevent>
      <p class="mt-0">
        {{ loginInfo.identity === 'mail' ? $t('data.login.check_email',  { email: otpMethod.data }) : $t('data.login.use_authentication_app') }}
      </p>
      <el-form-item
        prop="otpCode"
        :label="$t('data.login.enter_code_here')"
      >
        <el-input
          v-model="form.otpCode"
          ref="otp"
          :placeholder="$t('data.login.enter_code')"
          :disabled="calling"
          @keyup.native.enter="verifyOtp"
        ></el-input>
      </el-form-item>
      <el-form-item
        v-if="$route.name === 'login'"
        prop="saveDevice"
      >
        <el-checkbox
          v-model="form.saveDevice"
          :disabled="calling"
        >
          {{ $t('data.login.remember_device') }}
        </el-checkbox>
      </el-form-item>
    </el-form>
    <el-row type="flex" align="middle" justify="space-between">
      <el-button
      type="text"
      icon="el-icon-back"
      :disabled="calling"
      @click="$emit('back')"
    >{{ $t(`common.back`) }}</el-button>
      <el-button
      type="primary"
      :loading="calling"
      @click="verifyOtp"
    >{{ $t(`data.login.authenticate`) }}</el-button>
    </el-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    otpMethod: Object,
    calling: Boolean
  },
  data () {
    return {
      form: {
        otpCode: '',
        saveDevice: false,
      }
    }
  },
  mounted() {
    this.$nextTick(() => this.$refs?.otp?.focus());
  },
  methods: {
    async verifyOtp () {
      const data = {
        ...this.loginInfo?.auth_info?.payload,
        method: this.otpMethod.method,
        save_device: this.form.save_device,
        otp: this.form.otpCode
      }
      this.$emit('login', data)
    },
  }
})
</script>

<style scoped>
</style>
