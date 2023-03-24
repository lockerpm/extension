<template>
  <div class="w-full px-10 auth-form">
    <el-form
      ref="form"
      :model="form"
      :rules="enterpriseRules"
    >
      <el-form-item v-if="!isPasswordMethod" prop="email">
        <el-input
          v-model="form.email"
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
          v-model="form.password"
          :disabled="callingAPI"
          :placeholder="$t('data.login.password_placeholder')"
          @keyup.native.enter="handleLogin"
        >
        </el-input>
      </el-form-item>
    </el-form>
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

import cystackPlatformAPI from '@/api/cystack_platform'

export default Vue.extend({
  data () {
    return {
      callingAPI: false,
      form: {
        email: null,
        password: null,
      }
    }
  },
  computed: {
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
        && this.loginInfo.preloginData.login_method === 'password'
        && !this.loginInfo.preloginData.require_passwordless
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
      if (this.loginInfo?.user_info?.email) {
        this.form.email = this.loginInfo?.user_info?.email
      }
    },
    handleBack() {
      this.$store.commit('UPDATE_LOGIN_PAGE_INFO', {
        preloginData: null,
        user_info: null,
        auth_info: null,
        baseApiUrl: null,
        baseWsUrl: null,
      })
      this.$emit('back')
    },

    handleLogin() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.handleOnPremiseLogin();
        }
      })
    },

    async handleOnPremiseLogin() {
      if (this.callingAPI) { return }
      this.callingAPI = true;
      const payload =  {
        email: this.form.email,
        language: this.language
      }
      cystackPlatformAPI.users_onpremise_prelogin(payload).then(async (res) => {
        const response = res[0] || {}
        this.$store.commit('UPDATE_LOGIN_PAGE_INFO', {
          preloginData: response,
          user_info: payload
        })
        if (JSON.stringify(response) == '{}' || response.login_method === 'passwordless' || response.require_passwordless) {
          this.$router.push({ name: 'pwl-unlock' })
        }
        this.callingAPI = false
      }).catch ((error) => {
        this.callingAPI = false
        this.notify(error?.response?.message || this.$t('common.system_error'), 'error')
      })
    },

    async handleNext() {
      if (this.callingAPI) { return }
      this.callingAPI = true;
      const payload =  {
        email: this.form.email,
        password: this.form.password,
        language: this.language
      }
      // auth email + password
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
