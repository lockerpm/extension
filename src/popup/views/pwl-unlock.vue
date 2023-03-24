<template>
  <div class="w-full px-10 auth-form" v-loading="loginInfo.sending" style="width: 400px;">
    <div class="mt-14 text-center">
      <img
        src="@/assets/images/logo/logo_black.svg"
        alt=""
        class="h-[36px] mx-auto"
      >
      <div
        class="font-bold text-head-5 text-black-700 text-center mt-10 mb-4">
        {{$t('data.login.login')}}
      </div>
      <div class="inline-block select-none">
        <div class="rounded-[21px] flex items-center bg-black-250 p-1 mx-auto">
          <img
            :src="loginInfo.preloginData.avatar"
            alt=""
            class="w-[28px] h-[28px] rounded-full mr-2"
          >
          <div class="mr-2">{{ loginInfo.preloginData.email || loginInfo.preloginData.name }}</div>
        </div>
      </div>
    </div>
    <div v-if="alertData" class="w-full py-6">
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
    <div v-else-if="isPasswordlessMethod" class="w-full text-center mt-10">
      <div class="font-bold text-head-5 text-black-700 text-center mt-10">
        {{$t('data.login.unlock.title')}}
      </div>
      <p class="py-6">{{ $t('data.login.unlock.subtitle') }}</p>
      <p>
        <small>{{ $t('data.login.unlock.enter_otp') }}</small>
      </p>
      <div class="otp">
        <div class="otp__item" v-for="(item, index) in otpNumbers" :key="index">
          {{ item }}
        </div>
      </div>
    </div>
    <el-row type="flex" align="middle" justify="space-between" class="mt-4">
      <el-button
        type="text"
        icon="el-icon-back"
        @click="handleBack"
      >{{ $t(`common.back`) }}</el-button>
      <el-button
        @click="() => logout()"
      >{{ $t(`common.logout`) }}</el-button>
    </el-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  computed: {
    otpNumbers () {
      return `${this.loginInfo?.desktopAppData?.otp}`.split('')
    },
    isPasswordlessMethod () {
      return this.loginInfo.preloginData
        && (this.loginInfo.preloginData.login_method === 'passwordless' || this.loginInfo.preloginData.require_passwordless)
    },
    notLoginDesktopApp () {
      return (!this.loginInfo.desktopAppInstalled || this.loginInfo.desktopAppData?.msgType === 6) && this.isPasswordlessMethod
    },
    alertData () {
      if (!this.loginInfo.preloginData || JSON.stringify(this.loginInfo.preloginData) == '{}') {
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
        return null
      }
      return null
    }
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      if (this.isPasswordlessMethod) {
        this.reconnectDesktopAppSocket();
      }
    },
    handleBack() {
      if (this.isLoggedIn) {
        this.$router.push({ name: 'lock' })
      } else {
        this.$router.push({ name: 'login' })
      }
    }
  }
})
</script>

<style scoped lang="scss">
.otp {
  display: flex;
  align-items: center;
  justify-content: center;
  &__item {
    width: 32px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 12px 8px;
    border-bottom: 1px solid #A2A3A7;
    font-weight: bold;
    font-size: 16px;
  }
}
</style>
