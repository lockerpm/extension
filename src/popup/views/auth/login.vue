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
        {{$t('data.login.login')}}
      </div>
      <el-row type="flex" justify="space-between my-4 px-10" align="middle">
        <div class="text-base font-medium">
          {{ loginSubtitle }}
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
    </div>
    <Form
      v-if="loginInfo.login_step === 1"
      @next="() => updateLoginStep(2)"
      @get-access-token="getAccessToken"
    />
    <Identity
      v-else-if="loginInfo.login_step === 2"
      @back="() => updateLoginStep(1)"
      @next="() => updateLoginStep(3)"
    />
    <VerifyOTP
      v-else-if="loginInfo.login_step === 3"
      :otp-method="otpMethod"
      @back="() => updateLoginStep(2)"
      @get-access-token="getAccessToken"
    />
    <LogInWith
      :login_step="loginInfo.login_step"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import LogInWith from '@/popup/components/auth/LogInWith.vue'
import Form from '@/popup/components/auth/Form.vue'
import Identity from '@/popup/components/auth/Identity.vue'
import VerifyOTP from '@/popup/components/auth/VerifyOTP.vue'

import authAPI from '@/api/auth'
import meAPI from '@/api/me'
import cystackPlatformAPI from '@/api/cystack_platform'

export default Vue.extend({
  name: 'Login',
  components: {
    LogInWith,
    Form,
    Identity,
    VerifyOTP
  },
  data () {
    return {}
  },
  computed: {
    loginSubtitle() {
      if (this.loginInfo.login_step === 1) {
        return this.$t('data.login.login_option')
      }
      if (this.loginInfo.login_step === 2) {
        return this.$t('data.login.verify')
      }
      return this.$t('data.login.enter_code')
    },
    otpMethod () {
      return this.loginInfo.auth_info?.methods?.find((m) => m.type === this.loginInfo.identity)
    }
  },
  async mounted() {
    await this.$storageService.remove('cs_token')
  },
  methods: {
    updateLoginStep (value) {
      this.$store.commit('UPDATE_LOGIN_PAGE_INFO', {
        login_step: value
      })
    },
    async getAccessToken(callback){
      const payload = {
        SERVICE_URL: "/sso",
        SERVICE_SCOPE: "pwdmanager",
        CLIENT: "browser"
      }
      try {
        await authAPI.sso_last_active();
        const data: any = await authAPI.sso_access_token(payload);
        if(data.access_token){
          await this.$storageService.save('cs_token', data.access_token)
          const userInfo = await meAPI.me();
          cystackPlatformAPI.users_me_login_method().then(async (response: any) => {
            this.$store.commit('UPDATE_LOGIN_PAGE_INFO', {
              preloginData: {
                ...userInfo,
                ...response,
              }
            })
            if (response.login_method === 'passwordless' || response.require_passwordless) {
              this.$router.push({ name: 'pwl-unlock' }).catch(() => ({}))
            } else {
              await this.$store.dispatch("LoadCurrentUser");
              await this.$store.dispatch("LoadCurrentUserPw");
              await this.$runtimeBackground.updateStoreService('isLoggedIn', true)
              this.$store.commit('UPDATE_IS_LOGGEDIN', true)
              this.$router.push({ name: 'lock' }).catch(() => ({}))
            }
            callback()
          }).catch ((error) => {
            callback()
            this.notify(error?.response?.data?.message || this.$t('common.system_error'), 'error')
          })
        }
      } catch (error) {
        callback()
        this.notify(error?.response?.data?.message || this.$t('common.system_error'), 'error')
      }
    },
  }
})
</script>

<style scoped>
</style>
