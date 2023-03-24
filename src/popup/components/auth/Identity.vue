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
import { load } from 'recaptcha-v3';
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
      siteKey: process.env.VUE_APP_RECAPTCHA_SITE_KEY,
      recaptcha: null
    }
  },
  computed: {},
  async mounted () {
    this.recaptcha = await load(this.siteKey);
    this.newIdentity = this.loginInfo.identity;
  },
  methods: {
    changeIdentity (identity) {
      this.$store.commit('UPDATE_LOGIN_PAGE_INFO', {
        identity: identity
      })
    },
    getOtpMethod (type) {
      return this.loginInfo?.auth_info?.methods?.find((m) => m.type === type)
    },
    async nextMethod () {
      if (this.callingAPI) { return }
      if (this.loginInfo.identity === 'mail') {
        this.callingAPI = true;
        this.recaptcha = await load(this.siteKey);
        const token = await this.recaptcha.execute('login');
        authAPI.sso_auth_otp_mail({
          ...this.loginInfo.user_info,
          request_code: token
        }).then(() => {
          this.$emit('next')
          this.callingAPI = false
        }).catch((error) => {
          this.notify(error?.response?.message || error?.response?.data?.detail, 'error')
          this.callingAPI = false
        })
      } else {
        this.$emit('next')
      }
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
.grecaptcha-badge {
  display: none !important;
}
</style>
