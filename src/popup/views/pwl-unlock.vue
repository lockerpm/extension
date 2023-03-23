<template>
  <div style="width: 400px;">
    <div class="mt-14 text-center">
      <img
        src="@/assets/images/logo/logo_black.svg"
        alt=""
        class="h-[36px] mx-auto"
      >
    </div>
    <div class="w-full px-6 text-center mt-10">
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
      <el-button
        class="w-full mt-10"
        type="text"
        icon="el-icon-back"
        @click="() => handleBack()"
      >{{ $t('common.back') }}</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
  },
  computed: {
    otpNumbers () {
      return `${this.loginInfo?.desktopAppData?.otp}`.split('')
    }
  },
  methods: {
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
