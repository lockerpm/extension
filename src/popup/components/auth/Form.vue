<template>
  <div class="w-full px-10">
    <el-form
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
        v-if="!isEnterprise"
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
        @click="$emit('back')"
      >{{ $t(`common.back`) }}</el-button>
      <el-button
        type="primary"
        :loading="callingAPI"
        @click="handleLogin"
      >{{ $t(`data.login.sign_in`) }}</el-button>
    </el-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    isEnterprise: Boolean,
  },
  data () {
    return {
      callingAPI: false,
      form: {
        username: '',
        password: ''
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
            trigger: ['blur', 'change']
          },
        ],
        password: [
          {
            required: true,
            message: this.$t('data.login.message.required', { name: this.$t('data.login.password_placeholder') }),
            trigger: ['blur', 'change']
          },
        ]
      }
    }
  },
  mounted() {
    this.$nextTick(() => this.$refs.username.focus())
  },
  methods: {
    handleLogin() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (!this.isEnterprise) {
            this.originalLogin();
          } else {
            // logig on-primise
          }
        }
      })
    },
    async originalLogin() {
      if (this.callingAPI) { return }
      this.callingAPI = true;
      const payload =  {
        ...this.form,
        language: this.language
      }
      this.axios.post('/sso/auth', payload).then(async (response) => {
        if (response.is_factor2) {
          const msg: any = {
            command: 'authAccessToken',
            sender: { type: 'login' },
          };
          chrome.runtime.sendMessage(msg);
        } else {
          try {
            this.axios.post('/sso/me/last_active',{}, {
              headers: { Authorization: `Bearer ${response.token}` }
            })
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

    // openForgot () {},
  }
})
</script>

<style scoped>
</style>
