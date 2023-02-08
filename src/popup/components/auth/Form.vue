<template>
  <div class="w-full px-10">
    <el-form ref="form" :model="form" :rules="rules">
      <el-form-item prop="username">
        <el-input
          v-model="form.username"
          :disabled="callingAPI"
          :placeholder="$t('data.login.username_placeholder')"
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
        username: 'quyetnguyencr7@gmail.com',
        password: 'tienquyet1997@'
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
          this.$emit('update-auth', response)
          this.$emit('update-user', payload)
          this.$emit('next');
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
