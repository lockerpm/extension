<template>
  <div class="w-full px-10 auth-form">
    <el-form
      v-if="!isEnterprise"
      ref="form"
      :model="form"
      :rules="rules"
    >
      <el-form-item prop="username">
        <el-input
          v-model="form.username"
          ref="username"
          :disabled="callingAPI"
          :placeholder="$t('data.login.username_placeholder')"
          @keyup.native.enter="handleLogin"
        ></el-input>
      </el-form-item>
      <el-form-item
        prop="password"
      >
        <el-input
          type="password"
          v-model="form.password"
          :disabled="callingAPI"
          :placeholder="$t('data.login.password_placeholder')"
          @keyup.native.enter="handleLogin"
        >
        </el-input>
      </el-form-item>
    </el-form>
    <el-form
      v-else
      ref="enterpriseForm"
      :model="enterpriseForm"
      :rules="enterpriseRules"
    >
      <el-form-item v-if="!isPasswordMethod" prop="email">
        <el-input
          v-model="enterpriseForm.email"
          ref="email"
          :disabled="callingAPI"
          :placeholder="$t('common.email_placeholder')"
          @keyup.native.enter="handleLogin"
        ></el-input>
      </el-form-item>
      <el-form-item
        prop="password"
        v-if="isPasswordMethod"
      >
        <el-input
          type="password"
          v-model="enterpriseForm.password"
          :disabled="callingAPI"
          :placeholder="$t('data.login.password_placeholder')"
          @keyup.native.enter="handleLogin"
        >
        </el-input>
      </el-form-item>
    </el-form>
    <div v-if="alertData && !callingAPI" class="mb-6">
      <el-alert
        :title="alertData.title"
        :type="alertData.type || 'info'"
        :closable="false"
      >
      </el-alert>
      <el-row
        v-if="notLoginDesktopApp"
        type="flex"
        align="middle"
        justify="center"
        class="mt-3"
      >
        <a href="javascript:;">
          {{ $t(`common.download`) }}
        </a>
      </el-row>
    </div>
    <el-row type="flex" align="middle" justify="space-between">
      <el-button
        type="text"
        icon="el-icon-back"
        :disabled="callingAPI"
        @click="handleBack"
      >{{ $t(`common.back`) }}</el-button>
      <el-button
        v-if="!isPasswordMethod"
        type="primary"
        :loading="callingAPI"
        @click="handleLogin"
      >{{ $t(`data.login.sign_in`) }}</el-button>
      <el-button
        v-else
        type="primary"
        :loading="callingAPI"
        @click="handleNext"
      >{{ $t(`common.next`) }}</el-button>
    </el-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import authAPI from '@/api/auth'
import cystackPlatformAPI from '@/api/cystack_platform'

export default Vue.extend({
  props: {
    isEnterprise: Boolean,
  },
  data () {
    return {
      callingAPI: false,
      form: {
        username: null,
        password: null
      },
      enterpriseForm: {
        email: 'quyetnv@cystack.net',
        password: null,
      }
    }
  },
  computed: {
    rules () {
      return {
        username: [
          {
            required: true,
            message: this.$t('data.login.message.required', { name: this.$t('data.login.username_placeholder') }),
            trigger: ['change']
          },
        ],
        password: [
          {
            required: true,
            message: this.$t('data.login.message.required', { name: this.$t('data.login.password_placeholder') }),
            trigger: ['change']
          },
        ]
      }
    },
    enterpriseRules () {
      return {
        email: [
          {
            required: true,
            message: this.$t('data.login.message.required', { name: this.$t('common.email_placeholder') }),
            trigger: ['change']
          },
        ],
      }
    },
    isPasswordMethod () {
      return this.loginInfo.preloginData
        && this.loginInfo.preloginData[0]
        && this.loginInfo.preloginData[0].login_method === 'password'
        && !this.loginInfo.preloginData[0].require_passwordless
    },
    isPasswordlessMethod () {
      return this.loginInfo.preloginData
        && this.loginInfo.preloginData[0]
        && (this.loginInfo.preloginData[0].login_method === 'passwordless' || this.loginInfo.preloginData[0].require_passwordless)
    },
    notLoginDesktopApp () {
      return (!this.loginInfo.desktopAppInstalled || this.loginInfo.desktopAppData?.msgType === 6) && this.isPasswordlessMethod
    },
    alertData () {
      if (!this.enterpriseForm.email) {
        return null
      }
      if (this.loginInfo.preloginData) {
        const alertData = this.loginInfo.preloginData[0]
        if (!alertData) {
          return {
            type: 'warning',
            title: this.$t('data.login.alert.th1')
          }
        }
        if (this.isPasswordlessMethod) {
          if (this.notLoginDesktopApp) {
            return {
              type: 'warning',
              title: this.$t('data.login.alert.th2')
            }
          }
        }
      }
      return null
    }
  },
  mounted() {
    this.$nextTick(() => this.$refs.username.focus())
    this.loadData();
  },
  watch: {
    loginInfo: {
      handler() {
        this.loadData();
      },
      deep: true
    }
  },
  methods: {
    loadData() {
      if (this.loginInfo?.user_info?.username) {
        this.form.username = this.loginInfo?.user_info?.username
      }
      if (this.loginInfo?.user_info?.email) {
        this.enterpriseForm.email = this.loginInfo?.user_info?.email
      }
    },
    handleBack() {
      this.$store.commit('UPDATE_LOGIN_PAGE_INFO', {
        preloginData: null,
        user_info: null,
        auth_info: null,
        baseApiUrl: null
      })
      this.$emit('back')
    },

    handleLogin() {
      if (!this.isEnterprise) {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.originalLogin();
          }
        })
      } else {
        this.$refs.enterpriseForm.validate((valid) => {
          if (valid) {
            this.handlePrelogin();
          }
        })
      }
    },

    async originalLogin() {
      if (this.callingAPI) { return }
      this.callingAPI = true;
      const payload =  {
        ...this.form,
        language: this.language
      }
      authAPI.sso_auth(payload).then(async (response: any) => {
        if (response.is_factor2) {
          this.$store.commit('UPDATE_LOGIN_PAGE_INFO', {
            auth_info: response,
            user_info: payload
          })
          this.$emit('next');
        } else {
          try {
            await this.$storageService.save('cs_token', response.token)
            await this.$emit('get-access-token', response.token)
          }
          catch (e) {
            this.notify(e, 'warning')
          }
        }
        this.callingAPI = false
      }).catch ((error) => {
        this.callingAPI = false
        this.notify(error?.response?.data?.message, 'error')
      })
    },

    async handlePrelogin() {
      if (this.callingAPI) { return }
      this.callingAPI = true;
      const payload =  {
        email: this.enterpriseForm.email,
        language: this.language
      }
      cystackPlatformAPI.users_onpremise_prelogin(payload).then(async (response) => {
        this.$store.commit('UPDATE_LOGIN_PAGE_INFO', {
          preloginData: response,
          user_info: payload
        })
        if (this.isPasswordlessMethod) {
          this.reconnectDesktopAppSocket(payload.email);
        }
        setTimeout(() => {
          this.callingAPI = false
        }, 1000);
      }).catch ((error) => {
        this.callingAPI = false
        this.notify(error?.response?.data?.message, 'error')
      })
    },

    async handleNext() {
      if (this.callingAPI) { return }
      this.callingAPI = true;
      const payload =  {
        email: this.enterpriseForm.email,
        password: this.enterpriseForm.password,
        language: this.language
      }
      console.log(payload);
    }
  }
})
</script>

<style lang="scss">
.auth-form {
  .el-alert__content {
    padding: auto 0 !important;
  }
}
</style>
