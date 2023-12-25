<template>
  <div class="w-full px-10 auth-form">
    <el-form ref="form" :model="form" :rules="rules" @submit.native.prevent>
      <el-form-item v-if="!userPw" prop="username">
        <el-input
          v-model="form.username"
          ref="username"
          :disabled="callingAPI || !!userPw"
          :placeholder="$t('data.login.username_placeholder')"
          @input="() => { prelogin = null }"
          @keyup.native.enter="() => handleLogin()"
        ></el-input>
      </el-form-item>
      <div v-else class="flex items-center justify-center mb-4">
        <div class="rounded-[21px] flex items-center bg-black-250 p-1 mx-auto">
          <el-avatar :size="28" :src="userPw.avatar"></el-avatar>
          <p class="ml-2">{{ userPw.email }}</p>
        </div>
      </div>
      <div v-if="prelogin">
        <div v-if="isResetPassword">
          <i18n path="data.sign_in.reset_password" tag="p">
            <template v-slot:web>
              <a
                href="javascript:;"
                @click="() => openNewTab(`${webUrl}/authentication?email=${form.username}`)"
              >VinCSS Locker</a>
            </template>
          </i18n>
        </div>
        <div v-else-if="isSetupPasswordles">
          <i18n path="data.sign_in.require_pwl" tag="p">
            <template v-slot:web>
              <a
                href="javascript:;"
                @click="() => openNewTab(`${webUrl}/authentication?email=${form.username}`)"
              >VinCSS Locker</a>
            </template>
          </i18n>
        </div>
        <div v-else-if="isSetup2FA">
          <i18n path="data.sign_in.require_2fa" tag="p">
            <template v-slot:web>
              <a
                href="javascript:;"
                @click="() => openNewTab(`${webUrl}/setup-2fa?email=${form.username}`)"
              >VinCSS Locker</a>
            </template>
          </i18n>
        </div>
        <div v-else>
          <PairingForm
            v-if="isPair"
            :user-info="prelogin"
            @confirm="handlePairConfirm"
          />
          <PasswordlessForm
            v-else-if="prelogin.login_method === 'passwordless'"
            :changing="callingAPI"
            :user-info="prelogin"
            @repair="() => isPair = true"
            @confirm="(password) => handleLogin(password)"
          />
          <el-form-item
            v-else-if="prelogin.login_method === 'password'"
            prop="password"
          >
            <el-input type="password" v-model="form.password" :disabled="callingAPI"
              :placeholder="$t('data.login.password_placeholder')" @keyup.native.enter="() => handleLogin()">
            </el-input>
          </el-form-item>
        </div>
      </div>
    </el-form>
    <el-row v-if="!userPw" type="flex" align="middle" justify="space-between" class="mt-4 pb-4">
      <el-button
        v-if="!prelogin"
        class="w-full"
        type="primary"
        :loading="callingAPI"
        @click="() => handleLogin()"
      >
        {{ $t(`common.continue`) }}
      </el-button>
      <el-button
        v-else-if="!isResetPassword && !isSetup2FA && prelogin.login_method === 'password'"
        class="w-full"
        type="primary"
        :loading="callingAPI"
        @click="() => handleLogin()"
      >
        {{ $t(`data.login.sign_in`) }}
      </el-button>
      <el-button
        v-else-if="!callingAPI"
        class="w-full"
        @click="handleBack"
      >
        {{ $t(`common.back`) }}
      </el-button>
    </el-row>
    <div v-else class="mt-4 pb-4">
      <div v-if="userPw.login_method === 'password'" class="grid lg:grid-cols-2 grid-cols-1 gap-2">
        <div>
          <el-button
            class="w-full"
            :disabled="callingAPI"
            @click="() => handleLogout()"
          >
            {{ $t('common.logout') }}
          </el-button>
        </div>
        <div>
          <el-button
            type="primary"
            class="w-full"
            :loading="callingAPI"
            @click="() => handleLogin()"
          >
            {{ $t('master_password.unlock') }}
          </el-button>
        </div>
      </div>
      <el-button
        v-else
        class="w-full"
        @click="() => handleLogout()"
      >
        {{ $t(`common.logout`) }}
      </el-button>
    </div>
  </div>
</template>

<script lang="js">
import Vue from 'vue'
import PairingForm from '../forms/Pairing.vue'
import PasswordlessForm from '../forms/Passwordless.vue'

import cystackPlatformAPI from '@/api/cystack_platform'

export default Vue.extend({
  components: {
    PairingForm,
    PasswordlessForm
  },
  data() {
    return {
      webUrl: process.env.VUE_APP_WEB_URL,
      callingAPI: false,
      prelogin: null,
      isPair: false,
      form: {
        username: '',
        password: ''
      },
    }
  },
  computed: {
    isConnected() { return this.$store.state.isConnected },
    userPw() {return this.$store.state.userPw},
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
    isResetPassword () {
      return this.prelogin && !this.prelogin.is_password_changed
    },
    isSetupPasswordles () {
      return this.prelogin && this.prelogin.require_passwordless && this.prelogin.login_method === 'password'
    },
    isSetup2FA () {
      return this.prelogin && this.prelogin.require_2fa && !this.prelogin.is_factor2
    }
  },
  mounted() {
    this.$nextTick(() => this.$refs?.username?.focus())
    this.loadData();
  },
  watch: {
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
    handleBack() {
      this.prelogin = null
    },
    login(data) {
      this.$emit('next', {
        ...data,
        sync_all_platforms: this.prelogin.sync_all_platforms
      })
    },
    loadData() {
      if (this.userPw?.email) {
        this.form.username = this.userPw?.email;
        this.handlePrelogin();
      }
    },
    async handleLogin(pwl = null) {
      if (pwl) {
        await this.login({
          email: this.prelogin.email,
          password: pwl
        });
      } else {
        this.$refs.form.validate(async (valid) => {
          if (valid) {
            if (this.prelogin) {
              await this.login({
                email: this.prelogin.email,
                password: this.form.password
              });
            } else {
              this.handlePrelogin();
            }
          }
        })
      }
    },
    async handlePairConfirm() {
      this.isPair = false;
      if (this.prelogin.sync_all_platforms) {
        try {
          const serviceUser = await self.service.getCurrentUser();
          if (serviceUser?.email === this.prelogin.email) {
            await this.login(serviceUser);
          }
        } catch (error) {
          if (this.isConnected) {
            await self.service.resetBackgroundService();
          }
        }
      }
    },
    async handlePrelogin() {
      if (this.callingAPI) { return }
      this.callingAPI = true;
      await cystackPlatformAPI.users_prelogin({ email: this.form.username }).then(async (response) => {
        if (response.sync_all_platforms || response.login_method === 'passwordless') {
          this.isPair = !self.service.pairingService?.hasKey
          if (response.sync_all_platforms && !this.isPair) {
            try {
              const serviceUser = await self.service.getCurrentUser();
              if (serviceUser?.email === response.email) {
                await this.login(serviceUser)
              } else {
                this.prelogin = response;
              }
            } catch (error) {
              if (this.isConnected) {
                await self.service.resetBackgroundService();
              }
              this.prelogin = response
            }
          } else {
            this.prelogin = response
          }
        } else {
          this.prelogin = response
        }
      }).catch((error) => {
        this.prelogin = null
        this.notify(error?.response?.data?.message || this.$t('common.system_error'), 'error')
      })
      this.callingAPI = false;
    },
    async handleLogout() {
      await this.logout();
      this.prelogin = null;
      this.form = {
        username: '',
        password: ''
      }
    },
  }
})
</script>

<style lang="scss">
</style>
