<template>
  <div class="w-full px-10">
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
    >
      <el-form-item
        prop="password"
      >
        <el-input
          ref="password"
          type="password"
          v-model="form.password"
          :disabled="callingAPI"
          :placeholder="$t('data.login.new_password_placeholder')"
          @keyup.native.enter="handleSetNewPassword"
        >
        </el-input>
      </el-form-item>
      <el-form-item
        prop="confirmPassword"
      >
        <el-input
          type="password"
          v-model="form.confirmPassword"
          :disabled="callingAPI"
          :placeholder="$t('data.login.confirm_new_password_placeholder')"
          @keyup.native.enter="handleSetNewPassword"
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
        type="primary"
        :loading="callingAPI"
        @click="() => handleSetNewPassword()"
      >{{ $t(`common.submit`) }}</el-button>
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
  data () {
    return {
      callingAPI: false,
      form: {
        password: null,
        confirmPassword: null
      }
    }
  },
  computed: {
    rules () {
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
    }
  },
  mounted() {
    this.$nextTick(() => this.$refs.password.focus())
  },
  methods: {
    handleBack() {
      this.$emit('back')
    },

    handleSetNewPassword() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.callingAPI) { return }
          this.callingAPI = true;
          const payload =  {
            password: this.form.password,
            token: this.login_info.forgot_token
          }
          authAPI.sso_new_password(payload).then(async () => {
            this.$store.commit('UPDATE_LOGIN_PAGE_INFO', {
              login_step: 2,
              forgot_step: 1
            })
            this.$router.push({ name: 'login' });
            this.callingAPI = false
          }).catch ((error) => {
            this.callingAPI = false
            this.notify(error?.response?.data?.message || this.$t('common.system_error'), 'error')
          })
        }
      })
    }
  }
})
</script>

<style lang="scss">
</style>
