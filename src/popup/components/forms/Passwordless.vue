<template>
  <div v-loading="loading" class="w-full passwordless-form text-center">
    <div v-if="step === 0 && !callingAPI && !changing">
      <p class="mb-4 text-left">
        {{ $t('passwordless.choose_a_key') }}
      </p>
      <el-card
        v-if="devices.length === 0"
        body-style="padding: 6px 24px"
      >
        {{ $t('passwordless.no_key_found') }}
      </el-card>
      <el-card
        v-for="d in devices" :key="d.path"
        class="mt-4 cursor-pointer"
        body-style="padding: 6px 24px"
        :style="{ borderColor: selectedDevice && selectedDevice.path == d.path ? '#268334' : '' }"
        @click="() => selectedDevice = d"
      >
        <div class="flex items-center">
          <i class="fab fa-usb" style="font-size: 20px"></i>
          <p class="font-semibold ml-2">
            {{ d.name }}
          </p>
        </div>
      </el-card>
      <div class="mt-4">
        <el-button
          class="w-full"
          type="text"
          icon="el-icon-refresh"
          @click="getDeviceKeys"
        >
          {{$t('passwordless.reload_devices')}}
        </el-button>
      </div>
      <div class="mt-4">
        <el-button
          class="w-full"
          type="primary"
          :disabled="!selectedDevice"
          :loading="callingAPI"
          @click="getPwl"
        >
          {{$t('common.confirm')}}
        </el-button>
      </div>
    </div>
    <el-card
      v-if="(step !== 0 || (isTouch || isFingerprint)) && selectedDevice"
      class="mt-6"
      body-style="padding: 6px 24px"
      style="border-color: #268334;"
    >
      <div class="flex items-center">
        <i class="fab fa-usb" style="font-size: 20px"></i>
        <p class="font-semibold ml-2">
          {{ selectedDevice.name }}
        </p>
      </div>
    </el-card>
    <div
      v-if="step === 1 && !isTouch"
      class="mt-6"
    >
      <p class="mt-4 text-left">{{$t('passwordless.enter_key_pin')}}</p>
      <el-input
        class="mt-2"
        v-model="pin"
        type="password" 
        :disabled="callingAPI"
      ></el-input>
      <el-button
        class="w-full mt-10"
        type="primary"
        :disabled="!pin || !pin.trim()"
        :loading="callingAPI"
        @click="getPwl"
      >
        {{$t('common.continue')}}
      </el-button>
    </div>
    <div v-if="(isTouch || isFingerprint) && !passwordless" class="mt-10">
      <p class="mt-4 text-left">
        {{ isTouch ? $t('passwordless.touch_key') : $t('passwordless.scan_fingerprint') }}
      </p>
      <el-card class="mt-2">
        <i class="fas fa-fingerprint" style="font-size: 42px"></i>
      </el-card>
    </div>
    <div v-if="!!passwordless" class="mt-10 text-primary">
      <el-card body-style="padding: 16px">
        <i class="el-icon-circle-check" style="font-size: 28px; color:#268334"></i>
        <p class="text-head-5 mt-4">{{ $t('common.successfully') }}</p>
      </el-card>
      <i class="el-icon-loading mt-4" style="font-size: 24px;"></i>
    </div>
  </div>
</template>

<script lang="js">
import Vue from 'vue'
export default Vue.extend({
  props: {
    changing: Boolean,
    userInfo: Object,
  },
  data() {
    return {
      loading: false,
      selectedDevice: null,
      devices: [],
      step: 0,
      pin: null,
      passwordless: null,
      callingAPI: false
    }
  },
  computed: {
    isTouch() { return this.$store.state.isTouch },
    isFingerprint() { return this.$store.state.isFingerprint },
    isConnected() { return this.$store.state.isConnected },
  },
  beforeMount() {
    this.passwordless = null;
    this.resetState();
    this.getDeviceKeys();
  },
  watch: {
  },
  methods: {
    resetState() {
      this.$store.commit('UPDATE_IS_TOUCH', false);
      this.$store.commit('UPDATE_IS_FINGERPRINT', false);
    },

    async getDeviceKeys() {
      this.loading = true;
      try {
        this.devices = await self.service.getFidoDeviceList() || [];
        this.selectedDevice = this.devices[0] || null
      } catch (error) {
        this.redirectByError(error)
      }
      this.loading = false;
    },

    async resetService() {
      if (this.isConnected) {
        await self.service.resetBackgroundService();
      }
    },

    async getPwl() {
      this.callingAPI = true;
      try {
        const response = await self.service.getPasswordless({
          email: this.userInfo.email,
          devicePath: this.selectedDevice.path,
          pin: this.pin || null
        })
        this.step = 2;
        this.passwordless = response;
        this.$emit('confirm', response)
      } catch (error) {
        this.redirectByError(error)
      }
      this.callingAPI = false
    },

    async redirectByError(error) {
      console.log('Error', error);
      if (error.code) {
        this.notify(this.$t(`passwordless.errors.${error.code}`) || this.$t('common.system_error'), 'error')
      } else {
        this.notify(error?.message || this.$t('common.system_error'), 'error')
      }
      this.resetState()
      this.passwordless = null
      this.pin = null
      if (['0000'].includes(error.code)) {
        await this.resetService();
        this.step = 0;
      } else if (['2007', '2003', '2009'].includes(error.code)) {
        this.step = this.selectedDevice ? 1 : 0;
      } else if (['2008', '2005', '2002', '2004', '2006', '2011'].includes(error.code)) {
        this.step = 0;
      } else if (['5001', '5002'].includes(error.code)) {
        await this.resetService();
        this.step = 0;
      } else if (['2001'].includes(error.code)) {
        await this.resetService();
        this.step = 0;
        await this.getDeviceKeys();
      } else if (['5003'].includes(error.code)) {
        this.$emit('repair')
      } else {
        this.step = this.selectedDevice ? 1 : 0;
      }
    },
  }
})
</script>

<style lang="scss">
</style>
