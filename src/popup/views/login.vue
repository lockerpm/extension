<template>
  <div style="width: 400px;">
    <div class="mt-14 text-center">
      <img
        src="@/assets/images/logo/logo_black.svg"
        alt=""
        class="h-[36px] mx-auto"
      >
    </div>
    <div class="font-bold text-head-5 text-black-700 text-center mt-10">
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
    <Options
      v-if="login_step === 1"
      :optionValue="optionValue"
      @change-option="(value) => optionValue = value"
      @next="() => updateLoginStep(2)"
    />
    <Form
      v-else-if="login_step === 2"
      :isEnterprise="isEnterprise"
      @back="() => updateLoginStep(1)"
      @next="() => updateLoginStep(3)"
    />
    <Identity
      v-else-if="login_step === 3"
      :identity="identity"
      @change-identity="(value) => identity = value"
      @back="() => updateLoginStep(2)"
      @next="() => updateLoginStep(4)"
    />
    <VerifyOTP
      v-else-if="login_step === 4"
      :identity="identity"
      @back="() => updateLoginStep(3)"
    />
    <LogInWith />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Options from '../components/auth/Options.vue';
import LogInWith from '../components/auth/LogInWith.vue'
import Form from '../components/auth/Form.vue'
import Identity from '../components/auth/Identity.vue'
import VerifyOTP from '../components/auth/VerifyOTP.vue'

import { BrowserApi } from "@/browser/browserApi";
export default Vue.extend({
  name: 'Login',
  components: {
    Options,
    LogInWith,
    Form,
    Identity,
    VerifyOTP
  },
  data () {
    return {
      optionValue: 'individual_vault',
      login_step: 1,
      identity: 'email',

      user: {},
      error: null,
      send_mail: false,
      loading: false,
      userCopy: {},
      factor2: false,
      otp: '',
      loadingOtp: false,
      save_device: false,
      errors: {},
      step: 1,
      methods: [],
      loadingSendEmail: false,
      selectedMethod: {},
      value: 'mail',
    }
  },
  computed: {
    isEnterprise() {
      return this.optionValue === 'enterprise_vault'
    },
    loginSubtitle() {
      if (this.login_step === 1) {
        return this.$t('data.login.login_option')
      }
      if (this.login_step === 2) {
        return this.$t('data.login.login_option_locker', { option: this.$t(`data.login.options.${this.optionValue}`) })
      }
      if (this.login_step === 3) {
        return this.$t('data.login.verify')
      }
      return this.$t('data.login.enter_code')
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
      this.login_step = value
    },
    reset_state () {
      this.error = null
      this.send_mail = false
    },
    async login () {
      if (this.loading) { return }
      this.reset_state()
      try {
        const res = await this.axios.post('/sso/auth', {
          ...this.user
        })
        this.loading = false
        if (res.is_factor2) {
          this.factor2 = true
          this.step = 1
          this.methods = res.methods
          if (res.methods.length) {
            this.selectedMethod = res.methods[0]
            this.value = res.methods[0].type
          }
        } else {
          try {
            this.axios.post('/sso/me/last_active',{}, {headers: { Authorization: `Bearer ${res.token}` }})
            await this.getAccessToken(res.token)
          }
          catch (e) {
            this.notify(e, 'warning')
          }
        }
      }
      catch (e) {
        if (e.response) {
          this.loading = false
          this.error = e.response.data.message
          if (e.response.data.code === '1003') {
            this.send_mail = true
            Object.assign(this.userCopy, this.user)
          }
        }
      }
    },
    openForgot () {
      const url = `${process.env.VUE_APP_ID_URL}/forgot  `;
      this.$platformUtilsService.launchUri(url);
      BrowserApi.reloadOpenWindows();
      const thisWindow = window.open("", "_self");
      thisWindow.close();
    },
    async checkToken (access_token, authStrategy) {
      if (authStrategy === 'facebook' || authStrategy === 'google' || authStrategy === 'github') {
        const accessToken = access_token
        const url = '/sso/auth/social'
        try {
          const myHeaders = {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
          const data = await this.axios.post(url, {
            provider: authStrategy,
            access_token: accessToken.split(' ').pop(),
            scope: "pwdmanager"
          }, myHeaders)
          await this.getAccessToken(data.token)
        } catch (e) {
          this.notify('Login failed', 'error')
        }
      }
    },
    async postOtp () {
      try {
        this.loadingOtp = true
        const res = await this.axios.post('/sso/auth/otp', {
          ...this.user,
          otp: this.otp,
          method: this.selectedMethod.type,
          save_device: this.save_device
        })
        try {
          this.axios.post('/sso/me/last_active',{}, {headers: { Authorization: `Bearer ${res.token}` }})
          await this.getAccessToken(res.token)
        }
        catch (e) {
          this.notify(e, 'warning')
        }
      } catch (e) {
        this.loadingOtp = false
        if (e.response) {
          if (e.response.data.code === '1002') {
            this.errors = e.response.data
          }
        }
      }
    },
    selectMethod (method) {
      this.selectedMethod = method
      this.value = method.type
    },
    nextMethod () {
      if (this.loadingSendEmail) { return }

      if (this.selectedMethod.type === 'mail') {
        this.loadingSendEmail = true
        const url = '/sso/auth/otp/mail'
        this.axios.post(url, this.user)
          .then((res) => {
            this.loadingSendEmail = false
            this.step = 2
            this.$nextTick(() => this.$refs.otp.focus())
          }).catch(() => {
            this.loadingSendEmail = false
            this.factor2 = false
          })
      } else {
        this.step = 2
        this.$nextTick(() => this.$refs.otp.focus())
      }
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
        const data = await this.axios.post(url,payload,config)
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
        this.notify(error, 'warning')
      }
    }
  }
})
</script>

<style scoped>
</style>
