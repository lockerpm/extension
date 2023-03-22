<template>
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
      @click="() => $emit('back')"
    >{{ $t('common.back') }}</el-button>
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
  }
})
</script>

<style scoped lang="scss">
.otp {
  display: flex;
  align-items: center;
  justify-content: center;
  &__item {
    width: 40px;
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
