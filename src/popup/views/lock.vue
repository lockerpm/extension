<template>
  <BlankLayout>
    <div
      class="flex flex-grow flex-col items-center"
      style="width: 400px"
    >
      <div class="mt-[3rem]">
        <img
          src="@/assets/images/logo/logo_black.svg"
          alt=""
          class="h-[36px]"
        >
      </div>
      <div class="w-full py-[2.8125rem] px-6 text-center">
        <template v-if="step===1">
          <div class="text-head-4 font-semibold mb-2.5">
            {{ $t('master_password.enter_password_title') }}
          </div>
          <div v-if="!isPasswordlessMethod" class="text-base mb-4">
            {{ $t('master_password.enter_password_desc') }}
          </div>
          <div class="inline-block mb-8 select-none">
            <div class="rounded-[21px] flex items-center bg-black-250 p-1 mx-auto">
              <img
                :src="currentUser.avatar"
                alt=""
                class="w-[28px] h-[28px] rounded-full mr-2"
              >
              <div class="mr-2">{{ currentUser.email }}</div>
            </div>
          </div>
          <form
            v-if="!isPasswordlessMethod"
            class="mb-8"
            @submit.prevent="setMasterPass"
          >
            <div class="form-group mb-4">
              <label class="text-left">
                {{ $t('master_password.enter_password') }}
              </label>
              <div class="input-group mb-1.5">
                <input
                  ref="master-pass"
                  v-model="masterPassword"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  :class="[errors ? 'is-invalid' :'']"
                  :name="randomString()"
                  autocomplete="new-password"
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
              <div class="invalid-feedback">{{ $t('errors.invalid_password') }}</div>
              <div
                class="text-primary text-left cursor-pointer"
                @click="step = 2"
              >
                {{ $t('master_password.get_hint') }}
              </div>
            </div>
          </form>
          <div v-else-if="isPasswordlessMethod" class="mb-8">
            <el-alert              
              :title="$t('data.login.alert.lock')"
              type="warning"
              :closable="false"
            >
            </el-alert>
          </div>
          <div class="form-group">
            <div class="grid lg:grid-cols-2 grid-cols-1 gap-2">
              <button
                v-if="!isPasswordlessMethod"
                class="btn btn-primary w-full"
                :disabled="loading"
                @click="setMasterPass"
              >
                {{ $t('master_password.unlock') }}
              </button>
              <button
                v-else
                class="btn btn-primary w-full"
                :disabled="loading || lockedInDesktopApp"
                @click="reconnectDesktopAppSocket()"
              >
                {{ $t('master_password.unlock') }}
              </button>
              <button
                class="btn btn-default w-full"
                :disabled="loading"
                @click="logout"
              >
                {{ $t('common.logout') }}
              </button>
            </div>
          </div>
        </template>
        <template v-if="step===2">
          <div class="text-head-4 font-semibold mb-2.5">
            {{ $t('master_password.master_password_hint') }}
          </div>
          <div class="text-base mb-4">
            {{ $t('master_password.master_password_hint_desc') }}
          </div>
          <div class="inline-block mb-8 select-none">
            <div class="rounded-[21px] flex items-center bg-black-250 p-1 mx-auto">
              <img
                :src="currentUser.avatar"
                alt=""
                class="w-[28px] h-[28px] rounded-full mr-2"
              >
              <div class="mr-2">{{ currentUser.email }}</div>
            </div>
          </div>
          <div class="form-group">
            <button
              class="btn btn-primary w-full"
              :disabled="loadingSend"
              @click="sendHint"
            >
              {{ $t('master_password.send') }}
            </button>
          </div>
        </template>
        <template v-if="step===3">
          <img
            src="@/assets/images/icons/icon_settings.svg"
            alt=""
            class="mx-auto mb-4"
          >
          <div class="text-head-4 font-semibold mb-2.5">
            {{ $t('master_password.master_password_hint') }}
          </div>
          <div class="text-base mb-4">
            {{ $t('master_password.hint_success') }}
          </div>
          <button
            class="btn btn-clean !text-primary !pb-0"
            @click="step = 1"
          >
            <i class="fa fa-chevron-left" />&nbsp;&nbsp;&nbsp;{{ $t('master_password.back_login') }}
          </button>
        </template>
      </div>
      <div
        v-if="step === 2"
        class="mt-1"
      >
        <button
          class="btn btn-clean !text-primary"
          @click="step = 1"
        >
          <i class="fa fa-chevron-left" />&nbsp;&nbsp;&nbsp;{{ $t('master_password.back_login') }}
        </button>
      </div>
    </div>
  </BlankLayout>
</template>

<script>
import Vue from 'vue'
import BlankLayout from '@/components/layout/blank';

import cystackPlatformAPI from '@/api/cystack_platform';

export default Vue.extend({
  layout: 'blank',
  middleware: ['NotHaveAccountService'],
  components: {
    BlankLayout
  },
  data () {
    return {
      invalidPinAttempts: 0,
      masterPassword: '',
      loading: false,
      errors: false,
      showPassword: false,
      showHint: false,
      step: 1,
      loadingSend: false
    }
  },
  computed: {
    isPasswordlessMethod () {
      return this.loginInfo.preloginData && (this.loginInfo.preloginData.login_method === 'passwordless' || this.loginInfo.preloginData.require_passwordless)
    },
    lockedInDesktopApp() {
      return this.loginInfo.desktopAppData && this.loginInfo.desktopAppData.msgType === 7
    }
  },
  mounted() {
    this.$nextTick(() => this.$refs['master-pass'].focus())
  },
  methods: {
    async setMasterPass () {
      this.loading = true
      this.errors = false
      try {
        await this.login()
      } catch (e) {
        this.errors = true
      } finally {
        this.loading = false
      }

      if (this.errors) {
        this.invalidPinAttempts++
        if (this.invalidPinAttempts >= 5) {
          await this.logout()
          this.$messagingService.send('logout')
        }
      }
    },
    sendHint () {
      this.loadingSend = true
      cystackPlatformAPI.users_password_hint({
        email: this.currentUser.email
      }).then(() => {
        this.loadingSend = false
        this.step = 3
      })
    }
  }
})
</script>
