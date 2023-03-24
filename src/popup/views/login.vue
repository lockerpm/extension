<template>
  <div style="width: 400px;">
    <div class="mt-14 text-center">
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
    <Options
      v-if="loginInfo.login_step === 1"
      @next="() => updateLoginStep(2)"
    />
    <div v-else-if="loginInfo.login_step === 2">
      <Form
        v-if="isIndividual"
        @back="() => updateLoginStep(1)"
        @next="() => updateLoginStep(3)"
        @get-access-token="getAccessToken"
      />
      <BusinessForm
        v-if="isBusiness"
        @back="() => updateLoginStep(1)"
        @next="() => updateLoginStep(3)"
        @get-access-token="getBusinessAccessToken"
      />
      <OnPremiseForm
        v-if="isEnterprise"
        @back="() => updateLoginStep(1)"
      />
    </div>
    <Identity
      v-else-if="loginInfo.login_step === 3"
      @back="() => updateLoginStep(2)"
      @next="() => updateLoginStep(4)"
    />
    <VerifyOTP
      v-else-if="loginInfo.login_step === 4"
      :otp-method="otpMethod"
      @back="() => updateLoginStep(3)"
      @get-access-token="getAccessToken"
    />
    <LogInWith
      v-if="[2].includes(loginInfo.login_step) && !isEnterprise"
      :login_step="loginInfo.login_step"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Options from '../components/auth/Options.vue';
import LogInWith from '../components/auth/LogInWith.vue'
import Form from '../components/auth/Form.vue'
import BusinessForm from '../components/auth/BusinessForm.vue'
import OnPremiseForm from '../components/auth/OnPremiseForm.vue'
import Identity from '../components/auth/Identity.vue'
import VerifyOTP from '../components/auth/VerifyOTP.vue'

import authAPI from '@/api/auth'
import meAPI from '@/api/me'
import cystackPlatformAPI from '@/api/cystack_platform'

export default Vue.extend({
  name: 'Login',
  components: {
    Options,
    LogInWith,
    Form,
    BusinessForm,
    OnPremiseForm,
    Identity,
    VerifyOTP
  },
  data () {
    return {}
  },
  computed: {
    isIndividual() {
      return this.loginInfo.optionValue == 'individual_vault'
    },
    isBusiness() {
      return this.loginInfo.optionValue == 'business_vault'
    },
    isEnterprise() {
      return this.loginInfo.optionValue == 'enterprise_vault'
    },
    loginSubtitle() {
      if (this.loginInfo.login_step === 1) {
        return this.$t('data.login.login_option')
      }
      if (this.loginInfo.login_step === 2) {
        return this.$t('data.login.login_option_locker', { option: this.$t(`data.login.options.${this.loginInfo.optionValue}`) })
      }
      if (this.loginInfo.login_step === 3) {
        return this.$t('data.login.verify')
      }
      return this.$t('data.login.enter_code')
    },
    otpMethod () {
      return this.loginInfo.auth_info?.methods?.find((m) => m.type === this.loginInfo.identity)
    }
  },
  async mounted() {
    chrome.runtime.onMessage.addListener(
      async (msg: any, sender: chrome.runtime.MessageSender, response: any) => {
        switch(msg.command){
        case 'collectPageDetailsResponse':
          if (this.$route.name === 'login') {
            await this.$store.dispatch('LoadCurrentUser')
            this.$router.push({ name: 'lock' });
          }
          break;
        default:
          break;
        }
      }
    );
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
          chrome.runtime.sendMessage({
            command: 'updateStoreService',
            sender: { key: 'isLoggedIn', value: true },
          });
          this.$store.commit('UPDATE_IS_LOGGEDIN', true)
          this.$router.push({ name: 'lock' })
          callback()
        }
      } catch (error) {
        callback()
        this.notify(error?.response?.message || this.$t('common.system_error'), 'error')
      }
    },

    async getBusinessAccessToken(callback){
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
              this.$router.push({ name: 'pwl-unlock' })
            } else {
              chrome.runtime.sendMessage({
                command: 'updateStoreService',
                sender: { key: 'isLoggedIn', value: true },
              });
              this.$store.commit('UPDATE_IS_LOGGEDIN', true)
              this.$router.push({ name: 'lock' })
            }
            callback()
          }).catch ((error) => {
            callback()
            this.notify(error?.response?.message || this.$t('common.system_error'), 'error')
          })
        }
      } catch (error) {
        callback()
        this.notify(error?.response?.message || this.$t('common.system_error'), 'error')
      }
    },
  }
})
</script>

<style scoped>
</style>
