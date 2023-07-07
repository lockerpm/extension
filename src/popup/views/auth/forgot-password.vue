<template>
  <div class="w-full" style="padding-top: 3.5rem;">
    <div class="text-center">
      <img
        src="@/assets/images/logo/logo_black.svg"
        alt=""
        class="h-[36px] mx-auto"
      >
    </div>
    <div>
      <div
        class="font-bold text-head-5 text-black-700 text-center mt-10">
        {{$t('data.login.forgot_password')}}
      </div>
      <el-row v-if="loginInfo.forgot_step === 1" type="flex" justify="space-between my-4 px-10" align="middle">
        <div class="text-base font-medium">
          {{ $t('common.email_placeholder') }}
        </div>
        <div
          v-if="language !== 'vi'"
          class="cursor-pointer"
          @click="changeLang('vi')"
        >
          <span class="flag flag-us"></span>
        </div>
        <div v-else
          class="cursor-pointer"
          @click="changeLang('en')"
        >
          <span class="flag flag-vn"></span>
        </div>
      </el-row>
      <div v-else class="my-4"></div>
    </div>
    <ForgotForm
      v-if="loginInfo.forgot_step === 1"
      @back="() => updateForgotStep(1)"
      @next="() => updateForgotStep(2)"
    />
    <Identity
      v-else-if="loginInfo.forgot_step === 2"
      @back="() => updateForgotStep(1)"
      @next="() => updateForgotStep(3)"
    />
    <VerifyOTP
      v-else-if="loginInfo.forgot_step === 3"
      :otp-method="otpMethod"
      @back="() => updateForgotStep(2)"
      @next="() => updateForgotStep(4)"
    />
    <SetNewPassword
      v-else-if="loginInfo.forgot_step === 4"
      @back="() => updateForgotStep(3)"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ForgotForm from '@/popup/components/auth/ForgotForm.vue'
import Identity from '@/popup/components/auth/Identity.vue'
import VerifyOTP from '@/popup/components/auth/VerifyOTP.vue'
import SetNewPassword from '@/popup/components/auth/SetNewPassword.vue'

export default Vue.extend({
  name: 'ForgotPassword',
  components: {
    ForgotForm,
    Identity,
    VerifyOTP,
    SetNewPassword
  },
  computed: {
    otpMethod () {
      return this.loginInfo.auth_info?.methods?.find((m) => m.type === this.loginInfo.identity)
    }
  },
  methods: {
    updateForgotStep (value) {
      this.$store.commit('UPDATE_LOGIN_PAGE_INFO', {
        forgot_step: value
      })
    },
  }
})
</script>

<style scoped>
</style>
