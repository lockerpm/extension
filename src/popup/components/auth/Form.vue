<template>
  <div class="w-full px-10 auth-form">
    <el-form ref="form" :model="form" :rules="rules">
      <el-form-item prop="username">
        <el-input v-model="form.username" ref="username" :disabled="callingAPI"
          :placeholder="$t('data.login.username_placeholder')" @keyup.native.enter="handleLogin"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input type="password" v-model="form.password" :disabled="callingAPI"
          :placeholder="$t('data.login.password_placeholder')" @keyup.native.enter="handleLogin">
        </el-input>
      </el-form-item>
    </el-form>
    <div class="">
      <el-button type="text" :disabled="callingAPI" @click="handleForgotPassword">{{ $t(`data.login.forgot_password`) }}</el-button>
    </div>
    <el-row type="flex" align="middle" justify="space-between">
      <el-button class="w-full" type="primary" :loading="callingAPI" @click="handleLogin">{{ $t(`data.login.sign_in`) }}</el-button>
    </el-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import authAPI from '@/api/auth'

export default Vue.extend({
  data() {
    return {
      callingAPI: false,
      form: {
        username: '',
        password: ''
      },
    }
  },
  computed: {
    rules() {
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
    },
    language: {
      handler() {
        setTimeout(() => {
          this.$refs.form?.clearValidate();
        }, 10);
      },
      deep: true
    }
  },
  methods: {
    loadData() {
      if (this.loginInfo?.user_info?.username) {
        this.form.username = this.loginInfo?.user_info?.username
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
          this.originalLogin();
        }
      })
    },

    async originalLogin() {
      if (this.callingAPI) { return }
      this.callingAPI = true;
      const payload = {
        ...this.form,
        language: this.language
      }
      authAPI.sso_auth(payload).then(async (response: any) => {
        this.$store.commit('UPDATE_LOGIN_PAGE_INFO', {
          auth_info: { ...response },
          user_info: { ...payload }
        })
        if (response.is_factor2) {
          // this.$runtimeBackground.authAccessToken('captcha')
          this.$emit('next');
        } else {
          try {
            await this.$storageService.save('cs_token', response.token)
            await this.$emit('get-access-token', () => { this.callingAPI = false })
          }
          catch (e) {
            this.notify(e, 'warning')
            this.callingAPI = false
          }
        }
      }).catch((error) => {
        this.callingAPI = false
        this.notify(error?.response?.data?.message || this.$t('common.system_error'), 'error')
      })
    },

    handleForgotPassword() {
      this.$store.commit('UPDATE_LOGIN_PAGE_INFO', {
        user_info: this.form,
        forgot_step: 1,
      })
      this.$router.push({ name: 'forgot-password' }).catch(() => ({}))
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
