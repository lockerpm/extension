<template>
  <div class="w-full px-10">
    <el-form ref="form" :model="form" :rules="enterpriseRules">
      <el-form-item prop="username">
        <el-input v-model="form.username" ref="username" placeholder="Ex: test@example.com" :disabled="callingAPI"
          @keyup.native.enter="handleRestore"></el-input>
      </el-form-item>
    </el-form>
    <el-row type="flex" align="middle" justify="space-between">
      <el-button type="text" icon="el-icon-back" :disabled="callingAPI" @click="handleBack">{{ $t(`common.back`)
      }}</el-button>
      <el-button type="primary" :loading="callingAPI" @click="handleRestore">{{ $t(`common.restore`) }}</el-button>
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
        username: null
      }
    }
  },
  computed: {
    enterpriseRules() {
      return {
        username: [
          {
            required: true,
            message: this.$t('data.login.message.required', { name: this.$t('common.username_placeholder') }),
            trigger: ['change']
          },
        ],
      }
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
    },
    handleBack() {
      this.$store.commit('UPDATE_LOGIN_PAGE_INFO', {
        user_info: null,
        auth_info: null,
      })
      this.$router.push({ name: 'login' }).catch(() => ({}))
    },

    handleRestore() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.handleRequest();
        }
      })
    },

    handleRequest() {
      if (this.callingAPI) { return }
      this.callingAPI = true;
      const payload = {
        username: this.form.username,
        language: this.language
      }

      authAPI.sso_account_recovery(payload).then((response) => {
        this.$store.commit('UPDATE_LOGIN_PAGE_INFO', {
          auth_info: {
            methods: response
          },
          user_info: payload
        })
        this.$emit('next');
        this.callingAPI = false
      }).catch((error) => {
        this.callingAPI = false
        this.notify(error?.response?.data?.detail || this.$t('common.system_error'), 'error')
      })
    }
  }
})
</script>

<style lang="scss"></style>
