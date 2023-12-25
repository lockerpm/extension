<template>
  <div class="w-full px-10">
    <el-form>
      <el-form-item v-if="getOtpMethod('mail')">
        <el-radio
          v-model="newIdentity"
          label="mail"
          border
          class="flex w-full h-max"
          :disabled="callingAPI"
          @change="changeIdentity(newIdentity)"
        >
          <div>
            <p class="text-black-700">
              <i class="el-icon-message"></i>
              <span>Email {{ getOtpMethod('mail').data }}</span>
            </p>
            <el-button
              type="text"
              class="mb-0 pb-0"
              :disabled="callingAPI"
            >{{ $t('data.login.have_code') }}</el-button>
          </div>
        </el-radio>
      </el-form-item>
      <el-form-item v-if="getOtpMethod('smart_otp')">
        <el-radio
          v-model="newIdentity"
          label="smart_otp"
          border
          class="flex w-full h-max"
          :disabled="callingAPI"
          @change="changeIdentity(newIdentity)"
        >
          <div class="text-black-700">
            <i class="el-icon-mobile"></i>
            <span>{{ $t('data.login.authentication_app') }}</span>
          </div>
        </el-radio>
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
        @click="nextMethod"
      >{{ $t(`common.next`) }}</el-button>
    </el-row>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  components: {},
  props: {
  },
  data () {
    return {
      newIdentity: null,
      callingAPI: false,
    }
  },
  computed: {},
  async mounted () {
    const currentIdentity = this.getOtpMethod(this.loginInfo.identity)
    this.newIdentity = currentIdentity ? this.loginInfo.identity : this.loginInfo?.auth_info?.methods[0]?.method;
    this.changeIdentity(this.newIdentity)
  },
  methods: {
    changeIdentity (identity: any) {
      this.$store.commit('UPDATE_LOGIN_PAGE_INFO', {
        identity: identity
      })
    },
    getOtpMethod (type: any) {
      return this.loginInfo?.auth_info?.methods?.find((m) => m.method === type)
    },
    async nextMethod () {
      if (this.callingAPI) { return }
      if (this.loginInfo.identity === 'mail') {
        this.callingAPI = true;
        this.callingAPI = false;
      } else {
        this.$emit('next')
      }
    },
  }
})
</script>

<style scoped>
.h-max {
  height: max-content !important;
  padding: 12px !important;
}
.pb-0 {
  padding-bottom: 0 !important;
}
</style>

<style>
</style>
