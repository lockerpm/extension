<template>
  <div class="w-full px-10">
    <el-form>
      <el-form-item v-if="getOtpMethod('mail')">
        <el-radio
          v-model="newIdentity"
          label="mail"
          border
          class="flex w-full h-max"
          :disabled="callingAPI"
          @change="changeIdentity(newIdentity)"
        >
          <div>
            <p class="text-black-700">
              <i class="el-icon-message"></i>
              <span>Email {{ getOtpMethod('mail').data }}</span>
            </p>
            <el-button
              type="text"
              class="mb-0 pb-0"
              :disabled="callingAPI"
            >{{ $t('data.login.have_code') }}</el-button>
          </div>
        </el-radio>
      </el-form-item>
      <el-form-item v-if="getOtpMethod('smart_otp')">
        <el-radio
          v-model="newIdentity"
          label="smart_otp"
          border
          class="flex w-full h-max"
          :disabled="callingAPI"
          @change="changeIdentity(newIdentity)"
        >
          <div class="text-black-700">
            <i class="el-icon-mobile"></i>
            <span>{{ $t('data.login.authentication_app') }}</span>
          </div>
        </el-radio>
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
        @click="nextMethod"
      >{{ $t(`common.next`) }}</el-button>
    </el-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import authAPI from '@/api/auth'

export default Vue.extend({
  components: {},
  props: {
    auth_info: Object,
    user_info: Object
  },
  data () {
    return {
      newIdentity: null,
      callingAPI: false,
    }
  },
  computed: {},
  async mounted () {
    const currentIdentity = this.getOtpMethod(this.loginInfo.identity)
    this.newIdentity = currentIdentity ? this.loginInfo.identity : this.loginInfo?.auth_info?.methods[0].type;
    this.changeIdentity(this.newIdentity)
  },
  methods: {
    changeIdentity (identity: any) {
      this.$store.commit('UPDATE_LOGIN_PAGE_INFO', {
        identity: identity
      })
    },
    getOtpMethod (type: any) {
      return this.loginInfo?.auth_info?.methods?.find((m) => m.type === type)
    },
    async nextMethod () {
      if (this.callingAPI) { return }
      if (this.loginInfo.identity === 'mail') {
        this.callingAPI = true;
        const token = await this.$storageService.get('recaptcha_token');
        if (this.$route.name === 'login') {
          await this.authOtpMail(token)
        } else {
          await this.resetPassword(token)
        }
        this.callingAPI = false;
      } else {
        this.$emit('next')
      }
    },
    async authOtpMail (token: any) {
      authAPI.sso_auth_otp_mail({
        ...this.loginInfo.user_info,
        request_code: token
      }).then(() => {
        this.$emit('next')
        this.callingAPI = false
      }).catch((error) => {
        this.notify(error?.response?.data?.message || error?.response?.data?.detail, 'error')
        this.callingAPI = false
      })
    },
    async resetPassword (token: any) {
      authAPI.sso_reset_password({
        ...this.loginInfo.user_info,
        request_code: token,
        method: this.loginInfo.identity
      }).then(() => {
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
.h-max {
  height: max-content !important;
  padding: 12px !important;
}
.pb-0 {
  padding-bottom: 0 !important;
}
</style>

<style>
</style>
