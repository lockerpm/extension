<template>
  <div class="flex flex-grow flex-col items-center px-4 py-4">
    <div class="w-full max-w-[500px] text-center">
      <div class="text-head-4 font-semibold mb-2.5">{{$t('data.set_master_pass.create')}}</div>
      <div class="inline-block mb-8 select-none">
        <div class="flex items-center">
          <div class="rounded-[21px] flex items-center bg-black-250 p-1 mx-auto">
            <img :src="currentUser.avatar" alt="" class="w-[28px] h-[28px] rounded-full mr-2">
            <div class="mr-2">{{ currentUser.email }}</div>
          </div>
          <button
            class="btn btn-sm btn-clean btn-primary !px-3 !font-normal"
            @click="logout"
          >
            {{$t('data.set_master_pass.logout')}}
          </button>
        </div>
      </div>
      <div class="text-left">
        <div class="form-group !mb-4">
          <label>{{$t('data.set_master_pass.enter_pass')}}</label>
          <div class="input-group mb-1.5">
            <input
              v-model="masterPassword"
              :type="showPassword ? 'text' : 'password'"
              class="form-control"
              :name="randomString()"
              autocomplete="new-password"
            >
            <div class="input-group-append !bg-white">
              <button class="btn btn-icon" @click="showPassword = !showPassword">
                <i
                  class="far"
                  :class="{'fa-eye': !showPassword, 'fa-eye-slash': showPassword}"
                />
              </button>
            </div>
          </div>
          <PasswordStrengthBar v-if="masterPassword" :score="passwordStrength.score" />
        </div>
        <div class="form-group !mb-4">
          <label>{{$t('data.set_master_pass.confirm_pass')}}</label>
          <div class="input-group" :class="[errors.masterRePassword ? 'is-invalid' :'']">
            <input
              v-model="masterRePassword"
              :type="showRePassword ? 'text' : 'password'"
              class="form-control"
              name="repassword"
              placeholder=""
            >
            <div class="input-group-append !bg-white">
              <button class="btn btn-icon" @click="showRePassword = !showRePassword">
                <i
                  class="far"
                  :class="{'fa-eye': !showRePassword, 'fa-eye-slash': showRePassword}"
                />
              </button>
            </div>
          </div>
          <div class="invalid-feedback">{{ $t('errors.confirm_password') }}</div>
        </div>
        <div class="form-group !mb-8">
          <label>{{$t('data.set_master_pass.hint_pass')}}</label>
          <input
            v-model="masterPasswordHint"
            class="form-control"
            placeholder=""
            type="text"
          />
        </div>
      </div>
      <div class="form-group !mb-4">
        <button
          class="btn btn-primary w-full"
          :disabled="loading"
          @click="setMasterPass"
        >
          {{$t('data.set_master_pass.create_btn')}}
        </button>
      </div>
      <div class="md:w-[320px] text-black-600 mx-auto">
        {{$t('data.set_master_pass.note')}}
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import PasswordStrengthBar from '@/popup/components/password/PasswordStrengthBar'

import cystackPlatformAPI from '@/api/cystack_platform';

export default Vue.extend({
  components: { PasswordStrengthBar },
  layout: 'blank',
  middleware: ['HaveAccountService'],
  data () {
    return {
      masterPassword: '',
      masterRePassword: '',
      masterPasswordHint: '',
      loading: false,
      errors: {
      },
      showPassword: false,
      showRePassword: false
    }
  },
  computed: {
    passwordStrength () {
      return this.$passwordGenerationService.passwordStrength(this.masterPassword, ['cystack']) || {}
    }
  },
  watch: {
    masterRePassword (newValue) {
      if (this.masterPassword && newValue && this.masterPassword !== newValue) {
        this.errors.masterRePassword = 1
      } else {
        this.errors.masterRePassword = 0
      }
    }
  },
  methods: {
    async setMasterPass () {
      this.loading = true
      await this.$cryptoService.clearKeys();
      try {
        const kdf = 0
        const kdfIterations = 100000
        const referenceData = ''
        const key = await this.$cryptoService.makeKey(this.masterPassword, this.currentUser.email, kdf, kdfIterations)
        const encKey = await this.$cryptoService.makeEncKey(key)
        const hashedPassword = await this.$cryptoService.hashPassword(this.masterPassword, key)
        const keys = await this.$cryptoService.makeKeyPair(encKey[0])

        await this.$cryptoService.setKey(key)
        await this.$cryptoService.setKeyHash(hashedPassword)
        await this.$cryptoService.setEncKey(encKey[1].encryptedString)
        await this.$cryptoService.setEncPrivateKey(keys[1].encryptedString)
        await cystackPlatformAPI.users_register({
          name: this.currentUser.full_name,
          email: this.currentUser.email,
          master_password_hash: hashedPassword,
          master_password_hint: this.masterPasswordHint,
          key: encKey[1].encryptedString,
          kdf,
          kdf_iterations: kdfIterations,
          reference_data: referenceData,
          keys: {
            public_key: keys[0],
            encrypted_private_key: keys[1].encryptedString
          },
          score: this.passwordStrength.score
        })
        this.notify(this.$t('master_password.create_success'), 'success')
        this.$store.commit('UPDATE_USER_PW', { ...this.$store.state.userPw, is_pwd_manager: true })
        await this.login()
      } catch (e) {
        this.notify(this.$t('master_password.create_failed'), 'warning')
      } finally {
        this.loading = false
      }
    }
  }
})
</script>
