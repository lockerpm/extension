<template>
  <div class="w-full px-10">
    <el-form ref="form" :model="form" :rules="rules">
      <el-form-item prop="password">
        <el-input ref="password" type="password" v-model="form.password" :disabled="callingAPI"
          :placeholder="$t('data.login.new_password_placeholder')" @keyup.native.enter="handleSetNewPassword">
        </el-input>
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input type="password" v-model="form.confirmPassword" :disabled="callingAPI"
          :placeholder="$t('data.login.confirm_new_password_placeholder')" @keyup.native.enter="handleSetNewPassword">
        </el-input>
      </el-form-item>
    </el-form>
    <el-row type="flex" align="middle" justify="space-between">
      <el-button type="text" icon="el-icon-back" :disabled="callingAPI" @click="handleBack">{{ $t(`common.back`)
      }}</el-button>
      <el-button type="primary" :loading="callingAPI" @click="() => handleSetNewPassword()">{{ $t(`common.submit`)
      }}</el-button>
    </el-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import authAPI from '@/api/auth'

export default Vue.extend({
  props: {
    token: String
  },
  data() {
    return {
      callingAPI: false,
      form: {
        password: null,
        confirmPassword: null
      }
    }
  },
  computed: {
    rules() {
      const validatorConfirmPassword = (rule, value, callback) => {
        if (value !== this.form.password) {
          callback(new Error(this.$t('data.login.message.invalid', { name: this.$t('data.login.confirm_new_password_placeholder') })));
        }
        callback();
      }
      return {
        password: [
          {
            required: true,
            message: this.$t('data.login.message.required', { name: this.$t('data.login.new_password_placeholder') }),
            trigger: ['change']
          },
        ],
        confirmPassword: [
          {
            required: true,
            message: this.$t('data.login.message.required', { name: this.$t('data.login.confirm_new_password_placeholder') }),
            trigger: ['change']
          },
          {
            validator: validatorConfirmPassword,
            trigger: ['change']
          },
        ]
      }
    },
    resetToken() {
      const resetPasswordUrl = this.loginInfo.forgot_token?.reset_password_url || '';
      const paths = resetPasswordUrl.split('/')
      return paths.slice(-1) ? paths.slice(-1)[0] : ''
    }
  },
  mounted() {
    this.$nextTick(() => this.$refs.password.focus())
  },
  methods: {
    handleBack() {
      this.$emit('back')
    },

    async handleVerifyToken() {
      return await authAPI.sso_reset_password_verify_token(this.resetToken).then(() => {
        return true
      }).catch((error) => {
        this.notify(error?.response?.data?.message || this.$t('common.system_error'), 'error')
        return false
      })
    },

    async handleSetNewPassword() {
      this.$refs.form.validate(async (valid: any) => {
        if (valid) {
          const validToken = await this.handleVerifyToken()
          if (this.callingAPI || !validToken) { return }
          this.callingAPI = true;
          const payload = {
            new_password: this.form.password,
            token: this.resetToken
          }
          authAPI.sso_new_password(payload).then(async () => {
            this.$store.commit('UPDATE_LOGIN_PAGE_INFO', {
              login_step: 1,
              forgot_step: 1
            })
            this.notify(this.$t('data.notifications.change_password_success'), 'success')
            this.$router.push({ name: 'login' }).catch(() => ({}));
            this.callingAPI = false
          }).catch((error) => {
            this.callingAPI = false
            this.notify(error?.response?.data?.message || this.$t('common.system_error'), 'error')
          })
        }
      })
    }
  }
})
</script>

<style lang="scss"></style>
