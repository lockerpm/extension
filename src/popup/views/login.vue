<template>
  <div class="flex flex-grow flex-col items-center">
    <div class="md:w-[410px] md:mx-0 mx-5 py-[2.8125rem] px-6 text-center">
      <div
        v-if="!factor2"
        class="mb-4"
      >
        <div class="form-group !mb-4">
          <label class="text-left">
            Username/Emaillll
          </label>
          <div class="input-group mb-1.5">
            <input
              v-model="user.username"
              type="text"
              class="form-control"
              @keyup.enter="login"
            >
          </div>
          <div
            v-if="bugs.username"
            class="invalid-feedback"
          >
            {{ bugs.username[0] }}
          </div>
        </div>
        <div
          v-if="!factor2"
          :class="[bugs.password?'has-danger':'','form-group m-form__group']"
        >
          <div class="form-group !mb-4">
            <label class="text-left">
              Password
            </label>
            <div class="input-group mb-1.5">
              <input
                v-model="user.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                :name="randomString()"
                autocomplete="new-password"
                @keyup.enter="login"
              >
              <div class="input-group-append !bg-white">
                <button
                  class="btn btn-icon"
                  type="button"
                  tabindex="-1"
                  @click="showPassword = !showPassword"
                >
                  <i
                    class="far"
                    :class="{'fa-eye': !showPassword, 'fa-eye-slash': showPassword}"
                  />
                </button>
              </div>
            </div>
            <div
              v-if="bugs.password"
              class="invalid-feedback"
            >
              {{ bugs.password[0] }}
            </div>
          </div>
        </div>
      </div>
      <div v-if="factor2 && step === 1" class="text-left">
        <h3 class="text-[20px]">
          <a
            class=""
            @click="factor2=false"
          >
            <i class="fas fa-long-arrow-alt-left m--font-primary"></i>
          </a>
          Verify your identity
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
                  Authentication App
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
                I have a code
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
            Next
          </button>
        </div>
      </div>
      <div v-if="factor2 && (step === 2 || step === 3)" class="text-left">
        <h3 class="text-[20px]">
          <a
            class=""
            @click="step = 1"
          >
            <i class="fas fa-long-arrow-alt-left m--font-primary"></i>
          </a>
          Enter code
        </h3>
        <p v-if="selectedMethod.type === 'mail'">
          An email has been sent to {{selectedMethod.data}}. Check you inbox/spam to get verification code.
        </p>
        <p v-if="selectedMethod.type === 'smart_otp' && step !== 3">
          Please use your authentication app (such as Duo or Google Authenticator) to get the code.
        </p>

        <div :class="[errors.code === '1002'?'has-danger':'','form-group m-form__group']">
          <label>Enter verification code here</label>
          <input
            ref="otp"
            v-model="otp"
            class="form-control m-input mt-2"
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
              The authorization code is not valid.
            </div>
          </transition>
        </div>
        <div class="m-login__form-action mt-2">
          <!-- <div class="row m-login__form-sub">
            <div class="col m--align-left m-login__form-left pl-0">
              <el-checkbox v-model="save_device">
                Remember this device
              </el-checkbox>
            </div>
          </div> -->
          <button
            :class="[loadingOtp?'m-loader m-loader--light m-loader--left m-loader--md':'','btn btn-primary m-btn btn-block m-login__btn-cs text-uppercase']"
            type="button"
            :disabled="loadingOtp || !otp"
            @click="postOtp"
          >
            Authenticate
          </button>
        </div>
      </div>
      <transition
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
      </transition>
      <transition
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
            An email has been sent to:
            <div
              class="alert alert-info mt-3 mx-5 text-center"
              role="alert"
            >
              {{ userCopy.email }}
            </div>
            <p>
              Please go to your inbox now, open the email and follow the instructions.
            </p>
          </div>
        </div>
      </transition>
      <div v-if="!factor2">
        <div class="text-center mt-2">
          <div class="flex px-2 my-4 mx-auto">
            <div class="text-left w-full pl-0">
              <a
                v-if="!factor2"
                @click.prevent="openForgot"
                tag="a"
                class="text-[#0476e9] no-underline"
              >
                Forgot Password?
              </a>
            </div>
          </div>
          <button
            id="m_login_signin_submit"
            :loading="loading"
            class="btn btn-primary w-full"
            type="button"
            :disabled="loading"
            @click.prevent="login"
          >
            Login
          </button>
        </div>
        <div class="mt-3 text-center">
          <p class="mb-2">
            Or Log in with
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
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { BrowserApi } from "@/browser/browserApi";
export default Vue.extend({
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
  methods: {
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
            await this.$storageService.save('cs_token', res.token)
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
            this.axios.post('/sso/me/last_active')
            this.$router.push({ name: 'lock' })
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
      const url = `${process.env.VUE_APP_ID_URL
      }/login?SERVICE_URL=${encodeURIComponent(
        "/sso"
      )}&SERVICE_SCOPE=pwdmanager&CLIENT=browser&provider=${provider}`;

      this.$platformUtilsService.launchUri(url);
      BrowserApi.reloadOpenWindows();
      const thisWindow = window.open("", "_self");
      thisWindow.close();
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
          console.log('test')
          await this.$storageService.save('cs_token', res.token)
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
          this.axios.post('/sso/me/last_active')
          this.$router.push({ name: 'lock' })
        }
        catch (e) {
          this.notify(e, 'warning')
        }
        this.axios.post('/sso/me/last_active')
        this.$router.replace({ name: 'lock' })
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
    font-size: .85rem;
}
</style>
