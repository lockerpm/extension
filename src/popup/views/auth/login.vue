<template>
  <div class="w-full" style="padding-top: 1.5rem;">
    <div class="text-center">
      <img
        src="@/assets/images/logo/logo_black.png"
        alt=""
        class="h-[100px] mx-auto"
      >
    </div>
    <div>
      <div
        class="font-bold text-head-5 text-black-700 text-center mt-4">
        {{$t('data.login.login')}}
      </div>
      <el-row type="flex" justify="space-between my-4 px-10" align="middle">
        <div class="text-base font-medium">
          {{ loginSubtitle }}
        </div>
        <div
          v-if="language !== 'vi'"
          class="cursor-pointer"
          @click="changeLang('vi')"
        >
          <span class="flag flag-us"></span>
        </div>
        <div v-else
          class="cursor-pointer"
          @click="changeLang('en')"
        >
          <span class="flag flag-vn"></span>
        </div>
      </el-row>
      <PreloginForm
        v-if="loginInfo.login_step === 1"
        @next="(data) => login(data)"
      />
      <Identity
        v-else-if="loginInfo.login_step === 2"
        @back="() => updateLoginStep(1)"
        @next="() => updateLoginStep(3)"
      />
      <VerifyOTP
        v-else-if="loginInfo.login_step === 3"
        :otp-method="otpMethod"
        :callingAPI="$store.state.callingAPI"
        @back="() => updateLoginStep(2)"
        @login="(data) => login(data)"
      />
    </div>
  </div>
</template>

<script lang="js">
import Vue from 'vue'

import PreloginForm from '@/popup/components/auth/PreloginForm.vue'
import Identity from '@/popup/components/auth/Identity.vue'
import VerifyOTP from '@/popup/components/auth/VerifyOTP.vue'

import cystackPlatformAPI from '@/api/cystack_platform'
import commonAPI from '@/api/common'

import { SymmetricCryptoKey } from 'jslib-common/models/domain/symmetricCryptoKey';
import { Utils } from 'jslib-common/misc/utils';

export default Vue.extend({
  name: 'Login',
  components: {
    PreloginForm,
    Identity,
    VerifyOTP
  },
  data () {
    return {}
  },
  computed: {
    loginSubtitle() {
      if (this.loginInfo.login_step === 1) {
        return this.$t('data.login.login_option')
      }
      if (this.loginInfo.login_step === 2) {
        return this.$t('data.login.verify')
      }
      return this.$t('data.login.enter_code')
    },
    otpMethod () {
      return this.loginInfo.auth_info?.methods?.find((m) => m.method === this.loginInfo.identity)
    }
  },
  methods: {
    updateLoginStep (value) {
      this.$store.commit('UPDATE_LOGIN_PAGE_INFO', {
        login_step: value,
        auth_info: value === 1 ? {} : this.loginInfo.auth_info
      })
    },
    async login(data = {}) {
      this.$store.commit('UPDATE_CALLING_API', true)
      await this.$passService.clearGeneratePassword()
      const [deviceId, hideIcons, showFolders, enableAutofill] = await Promise.all([
        this.$storageService.get("device_id"),
        this.$storageService.get("hideIcons"),
        this.$storageService.get("showFolders"),
        this.$storageService.get("enableAutofill"),
      ]);
      this.$store.commit('UPDATE_HIDE_ICONS', hideIcons)
      this.$store.commit("UPDATE_SHOW_FOLDERS", showFolders);
      this.$store.commit("UPDATE_ENABLE_AUTOFILL", enableAutofill);
      try {
        await this.$cryptoService.clearKeys();
        let key = null;
        let hashedPassword = null;
        if (data.key && data.hashedPassword) {
          key = new SymmetricCryptoKey(Utils.fromB64ToArray(data?.key).buffer)
          hashedPassword = data.hashedPassword
        } else {
          key = await this.$cryptoService.makeKey(data.password, data.email, 0, 100000)
          hashedPassword = await this.$cryptoService.hashPassword(data.password, key)
        }
        let res = null;
        if (data.otp) {
          res = await cystackPlatformAPI.users_session_otp({
            email: data.email,
            client_id: 'browser',
            password: hashedPassword,
            device_name: this.$platformUtilsService.getDeviceString(),
            device_type: this.$platformUtilsService.getDevice(),
            device_identifier: deviceId,
            method: data.method,
            save_device: data.save_device || false,
            otp: data.otp
          })
        } else {
          res = await cystackPlatformAPI.users_session({
            email: data.email,
            client_id: 'browser',
            password: hashedPassword,
            device_name: this.$platformUtilsService.getDeviceString(),
            device_type: this.$platformUtilsService.getDevice(),
            device_identifier: deviceId
          })
        }
        if (res.is_factor2) {
          this.$store.commit('UPDATE_LOGIN_PAGE_INFO', {
            auth_info: {
              ...res,
              payload: data
            }
          })
          this.updateLoginStep(2);
          this.$store.commit('UPDATE_CALLING_API', false)
        } else {
          await this.$storageService.save('cs_token', res.access_token)
          await this.$tokenService.setTokens(res.access_token, res.refresh_token)
          await this.$userService.setInformation(this.$tokenService.getUserId(), data.email, 0, 100000)
          await this.$cryptoService.setKey(key)
          await this.$cryptoService.setKeyHash(hashedPassword)
          await this.$cryptoService.setEncKey(res.key)
          await this.$cryptoService.setEncPrivateKey(res.private_key)
  
          if (this.$vaultTimeoutService != null) {
            this.$vaultTimeoutService.biometricLocked = false
          }
          await this.$runtimeBackground.handleUnlocked('unlocked');
          await this.getSyncData()
          this.getExcludeDomains()
          this.$router.push({ name: 'vault' }).catch(() => ({}));
          this.$store.commit('UPDATE_CALLING_API', false);
          if (data.sync_all_platforms) {
            await commonAPI.service_login(this, {
              password: data.password,
              email: data.email,
            });
          }
          setTimeout(() => {
            this.setupFillPage();
          }, 1000);
        }
      } catch (e) {
        this.notify(this.$t("errors.invalid_master_password"), "error");
        this.$store.commit('UPDATE_CALLING_API', false)
      }
    },
  }
})
</script>

<style scoped>
</style>
