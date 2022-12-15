<template>
  <div class="flex flex-grow flex-col items-center mx-auto" style="width: 400px;">
    <div class="mt-[3rem] text-center">
      <img
        src="@/assets/images/logo/logo_black.svg"
        alt=""
        class="h-[36px] mx-auto"
      >
    </div>
    <div class="w-full p-6 text-center mt-14">
      <div class="font-bold text-head-4 text-black-700 mt-7">
        {{$t('data.login.login')}}
      </div>
      <div class="text-base mt-2 mb-6">
        {{$t('data.login.login_desc')}}
      </div>
      <button
        class="btn btn-primary w-3/4"
        @click="openLogin"
      >
        Single Sign-On
      </button>
      <!-- <div
        v-if="!factor2"
        class="mb-4"
      >
        <InputText
          v-model="user.username"
          label="Email / Username"
          class="w-full"
          @done="login"
        />
        <InputText
          v-model="user.password"
          :label="$t('data.ciphers.password')"
          class="w-full"
          is-password
          @done="login"
        />
      </div> -->
      <!-- <div
        v-if="factor2 && step === 1"
        class="text-left"
      >
        <h3 class="text-[20px] py-6">
          <a
            class=""
            @click="factor2=false"
          >
            <i class="fas fa-long-arrow-alt-left m--font-primary"></i>
          </a>
          {{$t('data.login.verify')}}
        </h3>
        <label
          v-for="m in methods"
          :key="m.type"
          class="m-option"
          @click="selectMethod(m)"
        >
          <span class="m-option__control">
            <span class="m-radio m-radio--brand m-radio--check-bold">
              <input
                v-model="value"
                type="radio"
                name="m_option_1"
                :value="m.type"
              >
              <span></span>
            </span>
          </span>
          <span class="m-option__label">
            <span class="m-option__head">
              <span class="m-option__title">
                <i
                  v-if="m.type === 'mail'"
                  class="fas fa-envelope"
                ></i>
                <i
                  v-if="m.type === 'smart_otp'"
                  class="fas fa-mobile"
                ></i>
                <span v-if="m.type === 'mail'">
                  Email {{ m.data }}
                </span>
                <span v-if="m.type === 'smart_otp'">
                  {{$t('data.login.authentication_app')}}
                </span>
              </span>
              <span class="m-option__focus"></span>
            </span>
            <span
              v-if="m.type === 'mail'"
              class="m-option__body"
            >
              <a
                class="m-link m-link--primary _clickable m--font-primary m--icon-font-size-sm3"
                @click="step = 3"
              >
                {{$t('data.login.have_code')}}
              </a>
            </span>
          </span>
        </label>
        <div class="m-login__form-action mt-4 text-right">
          <button
            class="btn btn-primary btn-sm m-btn--wide m-btn"
            :class="[loading?'m-loader  m-loader--light m-loader--left m-loader--md':'']"
            :disabled="loading"
            @click="nextMethod"
          >
            {{$t('data.login.next')}}
          </button>
        </div>
      </div> -->
      <!-- <div
        v-if="factor2 && (step === 2 || step === 3)"
        class="text-left"
      >
        <h3 class="text-[20px] py-6">
          <a
            class=""
            @click="step = 1"
          >
            <i class="fas fa-long-arrow-alt-left m--font-primary"></i>
          </a>
          {{$t('data.login.enter_code')}}
        </h3>
        <p v-if="selectedMethod.type === 'mail'">
          {{$t('data.login.check_email', {email: selectedMethod.data})}}
        </p>
        <p v-if="selectedMethod.type === 'smart_otp' && step !== 3">
          {{$t('data.login.use_authentication_app')}}
        </p>

        <div :class="[errors.code === '1002'?'has-danger':'','form-group m-form__group']">
          <label>{{$t('data.login.enter_code_here')}}</label>
          <input
            ref="otp"
            v-model="otp"
            class="form-control m-input mt-4"
            :name="randomString()"
          >
          <transition
            name="custom-classes-transition"
            enter-active-class="animated flipInX"
          >
            <div
              v-if="errors.code === '1002'"
              class="text-danger-500"
            >
              {{$t('data.login.authorization_error')}}
            </div>
          </transition>
        </div>
        <div class="m-login__form-action mt-2">
          <div class="row m-login__form-sub mb-3">
            <div class="col m--align-left m-login__form-left pl-0">
              <el-checkbox v-model="save_device">
                {{$t('data.login.remember_device')}}
              </el-checkbox>
            </div>
          </div>
          <button
            class="btn btn-primary uppercase w-full"
            type="button"
            :disabled="loadingOtp || !otp"
            @click="postOtp"
            :loading="loadingOtp"
          >
            {{$t('data.login.authenticate')}}
          </button>
        </div>
      </div> -->
      <!-- <transition
        name="custom-classes-transition"
        enter-active-class="animated flipInX"
        leave-active-class="animated flipOutX"
      >
        <div
          v-if="error!=null"
          class="text-danger-500"
          role="alert"
        >
          {{ error }}
        </div>
      </transition> -->
      <!-- <transition
        name="custom-classes-transition"
        enter-active-class="animated flipInX"
        leave-active-class="animated flipOutX"
      >
        <div
          v-show="send_mail"
          class="m-alert m-alert--icon m-alert--outline alert alert-info px-5 py-2"
          role="alert"
        >
          <div class="m-login__desc">
            {{$t('data.login.email_sent')}}
            <div
              class="alert alert-info mt-3 mx-5 text-center"
              role="alert"
            >
              {{ userCopy.email }}
            </div>
            <p>
              {{$t('data.login.go_to_inbox')}}
            </p>
          </div>
        </div>
      </transition> -->
      <div v-if="!factor2">
        <div class="text-center mt-2">
          <!-- <button
            id="m_login_signin_submit"
            :loading="loading"
            class="btn btn-primary w-full"
            type="button"
            :disabled="loading"
            @click.prevent="login"
          >
            {{$t('data.login.login')}}
          </button> -->
          <!-- <div class="flex px-2 my-4 mx-auto">
            <div class="text-left w-full pl-0 text-center">
              <a
                @click.prevent="openForgot"
                tag="a"
                class="text-[#0476e9] no-underline"
              >
                {{$t('data.login.forgot_password')}}
              </a>
            </div>
          </div> -->
        </div>
        <div
          class="mx-auto border border-black-500 h-[1px]"
          style="width: 30px; margin-top: 30px"
        >
        </div>
        <div class="mt-3 text-center">
          <p class="mb-2">
            {{$t('data.login.login_with')}}
          </p>
          <button
            v-for="s in strategies"
            :key="s.key"
            type="button"
            class="m-btn--icon btn-icon-login m-btn--pill"
            @click="loginWith(s.key)"
          >
            <img
              class="social__app-icon"
              :src="require(`@/assets/images/icons/${s.key}.svg`)"
              :alt="s.key"
            >
          </button>
        </div>
        <div class="absolute" style="bottom: 20px; width: 400px; padding-right: 48px">
          <div class="flex px-2 my-4 mx-auto">
            <div class="w-full pl-0 text-center">
              <span>
                {{$t('data.login.dont_have_account')}}
                <a
                @click.prevent="openRegister"
                tag="a"
                class="text-[#0476e9] no-underline"
              >
                {{$t('data.login.sign_up')}}
              </a>
              </span>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BrowserApi } from "@/browser/browserApi";
// import InputText from '@/components/input/InputText'
export default Vue.extend({
  components: {
    // InputText
  },
  data () {
    return {
      user: {},
      error: null,
      send_mail: false,
      loading: false,
      userCopy: {},
      bugs: {},
      typePassword: 'password',
      factor2: false,
      otp: '',
      loadingOtp: false,
      save_device: false,
      errors: {},
      step: 1,
      methods: [],
      loadingSendEmail: false,
      selectedMethod: {
      },
      value: 'mail',
      showPassword: false
    }
  },
  async mounted() {
    chrome.runtime.onMessage.addListener(
      async (msg: any, sender: chrome.runtime.MessageSender, response: any) => {
        switch(msg.command){
        case 'loginWithSuccess':
          await this.checkToken(msg.access_token, msg.provider);
          break;
        default:
          break;
        }
      }
    );
  },
  methods: {
    openLogin() {
      let url = `${
        process.env.VUE_APP_ID_URL
      }/login?SERVICE_URL=${encodeURIComponent(
        "/sso"
      )}&SERVICE_SCOPE=pwdmanager&CLIENT=browser`;
      if (process.env.VUE_APP_ENVIRONMENT == 'dev') {
        url += '&ENVIRONMENT=dev'
      }
      this.$platformUtilsService.launchUri(url);
      BrowserApi.reloadOpenWindows();
      const thisWindow = window.open("", "_self");
      thisWindow.close();
    },
    async processMessage(msg: any, sender: any, sendResponse: any) {
      switch (msg.command) {
      case "loginWithSuccess":
        await this.checkToken(msg.access_token, msg.provider)
        break;
      default:
        break;
      }
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
            // await this.$storageService.save('cs_token', res.token)
            // const store = await this.$storageService.get('cs_store')
            // let oldStoreParsed = {}
            // if (typeof store === 'object') {
            //   oldStoreParsed = store
            // }
            // await this.$storageService.save('cs_store', {
            //   ...oldStoreParsed,
            //   isLoggedIn: true,
            // })
            // console.log({
            //   ...oldStoreParsed,
            //   isLoggedIn: true,
            // })
            // this.$store.commit('UPDATE_IS_LOGGEDIN', true)
            this.axios.post('/sso/me/last_active',{}, {headers: { Authorization: `Bearer ${res.token}` }})
            // this.$router.push({name: 'lock'})
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
      const url = `${process.env.VUE_APP_ID_URL
      }/forgot  `;

      this.$platformUtilsService.launchUri(url);
      BrowserApi.reloadOpenWindows();
      const thisWindow = window.open("", "_self");
      thisWindow.close();
    },
    loginWith (provider) {
      // if(provider === 'google'){
      //   chrome.runtime.sendMessage({ command: 'loginWithGG', provider });
      // }
      // else if(provider === 'facebook'){
      //   chrome.runtime.sendMessage({ command: 'loginWithFB', provider });
      // }
      // else if(provider === 'github'){
      //   chrome.runtime.sendMessage({ command: 'loginWithGithub', provider });
      // }
      let url = `${process.env.VUE_APP_ID_URL
      }/login?SERVICE_URL=${encodeURIComponent(
        "/sso"
      )}&SERVICE_SCOPE=pwdmanager&CLIENT=browser&provider=${provider}`;
      if (process.env.VUE_APP_ENVIRONMENT == 'dev') {
        url += '&ENVIRONMENT=dev'
      }
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
          // this.$router.replace({ name: 'login' })
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
    openRegister() {
      const url = `${
        process.env.VUE_APP_ID_URL
      }/register?SERVICE_URL=${encodeURIComponent(
        "/sso"
      )}&SERVICE_SCOPE=pwdmanager&CLIENT=browser`;
      this.$platformUtilsService.launchUri(url);
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
          const store = await this.$storageService.get('cs_store')
          let oldStoreParsed = {}
          if (typeof store === 'object') {
            oldStoreParsed = store
          }
          await this.$storageService.save('cs_store', {
            ...oldStoreParsed,
            isLoggedIn: true,
          })
          console.log({
            ...oldStoreParsed,
            isLoggedIn: true,
          })
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
.m-btn--icon {
  width: 43px;
  height: 43px;
  text-align: center;
  padding-top: 5px;
}
.btn-icon-login {
  background: transparent !important;
}
.btn-icon-login:hover {
  background: rgba(9, 30, 66, 0.02) !important;
  box-shadow: 1px 1px 5px 0 rgba(0, 0, 0, 0.2) !important;
}
.m-btn--pill {
  border-radius: 60px;
}
.social__app-icon {
  display: inline-block;
  height: 20px;
  vertical-align: -0.2rem;
  width: 20px;
  border-radius: 0;
}
.m-option {
  display: flex;
  padding: 1.4em;
  border-radius: 6px;
  border: 1px solid #ebedf2;
}
.m-option .m-option__control {
  width: 2.7rem;
  padding-top: 0.1rem;
}
.m-option .m-option__label {
  width: 100%;
}
.m-option .m-option__label .m-option__body {
  display: block;
  padding-top: 0.7rem;
  font-size: 0.85rem;
}
</style>
