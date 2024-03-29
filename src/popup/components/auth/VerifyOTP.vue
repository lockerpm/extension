<template>
  <div class="w-full px-10">
    <el-form :model="form">
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
          :disabled="callingAPI"
          @keyup.native.enter="verifyOtp"
        ></el-input>
      </el-form-item>
      <el-form-item
        v-if="$route.name === 'login'"
        prop="saveDevice"
      >
        <el-checkbox
          v-model="form.saveDevice"
          :disabled="callingAPI"
        >
          {{ $t('data.login.remember_device') }}
        </el-checkbox>
      </el-form-item>
    </el-form>
    <el-row type="flex" align="middle" justify="space-between">
      <el-button
      type="text"
      icon="el-icon-back"
      :disabled="callingAPI"
      @click="$emit('back')"
    >{{ $t(`common.back`) }}</el-button>
      <el-button
      type="primary"
      :loading="callingAPI"
      @click="verifyOtp"
    >{{ $t(`data.login.authenticate`) }}</el-button>
    </el-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import authAPI from '@/api/auth'

export default Vue.extend({
  props: {
    otpMethod: Object,
  },
  data () {
    return {
      callingAPI: false,
      form: {
        otpCode: '',
        saveDevice: false,
      }
    }
  },
  mounted() {
    this.$nextTick(() => this.$refs.otp.focus())
  },
  methods: {
    async verifyOtp () {
      try {
        this.callingAPI = true
        if (this.$route.name === 'login') {
          await this.authOtp();
        } else {
          await this.resetPassword();
        }
        this.callingAPI = false
      } catch (error) {
        this.notify(error?.response?.data?.message || this.$t('common.system_error'), 'error')
        this.callingAPI = false
      }
    },
    async authOtp () {
      const res: any = await authAPI.sso_auth_otp({
        ...this.loginInfo.user_info,
        otp: this.form.otpCode,
        method: this.loginInfo.identity,
        save_device: this.form.saveDevice
      })
      try {
        await this.$storageService.save('cs_token', res.token)
        await this.$emit('get-access-token', res.token)
      } catch (error) {
        this.notify(error?.response?.data?.message || this.$t('common.system_error'), 'error')
      }
    },
    async resetPassword () {
      authAPI.sso_reset_password_token({
        username: this.loginInfo.user_info.username,
        account_recovery: this.loginInfo.user_info.username,
        code: this.form.otpCode,
        language: this.language,
        method: this.loginInfo.identity
      }).then((response) => {
        this.$store.commit('UPDATE_LOGIN_PAGE_INFO', {
          forgot_token: response
        })
        this.$emit('next')
        this.callingAPI = false
      }).catch((error) => {
        this.notify(error?.response?.data?.message || error?.response?.data?.detail, 'error')
        this.callingAPI = false
      })
    },
  }
})
</script>

<style scoped>
</style>
