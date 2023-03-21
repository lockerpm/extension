<template>
  <div style="width: 400px;">
    <div class="mt-14 text-center">
      <img
        src="@/assets/images/logo/logo_black.svg"
        alt=""
        class="h-[36px] mx-auto"
      >
    </div>
    <div v-if="loginInfo.login_step !== 5">
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
    <Form
      v-else-if="loginInfo.login_step === 2"
      :isEnterprise="isEnterprise"
      @back="() => updateLoginStep(1)"
      @next="() => updateLoginStep(3)"
      @get-access-token="getAccessToken"
    />
    <PWLUnlock
      v-if="loginInfo.login_step === 5"
    />
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
      v-if="[1, 2].includes(loginInfo.login_step) && !isEnterprise"
      :login_step="loginInfo.login_step"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Options from '../components/auth/Options.vue';
import LogInWith from '../components/auth/LogInWith.vue'
import Form from '../components/auth/Form.vue'
import Identity from '../components/auth/Identity.vue'
import VerifyOTP from '../components/auth/VerifyOTP.vue'
import PWLUnlock from '../components/auth/PWLUnlock.vue'

export default Vue.extend({
  name: 'Login',
  components: {
    Options,
    LogInWith,
    Form,
    Identity,
    VerifyOTP,
    PWLUnlock
  },
  data () {
    return {}
  },
  computed: {
    isEnterprise() {
      return this.loginInfo.optionValue === 'enterprise_vault' && this.loginInfo.login_step !== 1
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
    async getAccessToken(token){
      const url = '/sso/access_token'
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }
      const payload = {
        SERVICE_URL: "/sso",
        SERVICE_SCOPE: "pwdmanager",
        CLIENT: "browser"
      }
      try {
        this.axios.post('/sso/me/last_active', {}, config)
        const data = await this.axios.post(url, payload, config)
        if(data.url){
          const url = data.url
          let token = url.substring(url.indexOf("token")+6)
          token = token.indexOf("&") === -1?token:token.substring(0, token.indexOf("&"))
          await this.$storageService.save('cs_token', token)
          chrome.runtime.sendMessage({
            command: 'updateStoreService',
            sender: { key: 'isLoggedIn', value: true },
          });
          this.$store.commit('UPDATE_IS_LOGGEDIN', true)
          this.$router.push({ name: 'lock' })
        }
      } catch (error) {
        this.notify(error?.response?.data?.message, 'error')
      }
    },
  }
})
</script>

<style scoped>
</style>
