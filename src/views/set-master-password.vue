<template>
  <BlankLayout>
    <div class="flex flex-grow flex-col items-center">
      <div class="mt-[5.625rem] mb-5">
        <img src="@/assets/images/logo/logo_black.svg" alt="" class="h-[36px]">
      </div>
      <div class="w-full max-w-[500px] text-center">
        <div class="text-head-4 font-semibold mb-2.5">Tạo Master Password</div>
        <!--        <div class="text-base text-black-600 mb-4">-->
        <!--          Master Password là mật khẩu mở khóa Locker của bạn-->
        <!--        </div>-->
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
              Đăng xuất
            </button>
          </div>
        </div>
        <div class="text-left">
          <div class="form-group !mb-4">
            <label>Nhập Master Password</label>
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
            <label>Xác nhận Master Password</label>
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
            <label>Gợi ý mật khẩu (tuỳ chọn)</label>
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
            Tạo mật khẩu
          </button>
        </div>
        <div class="md:w-[320px] text-black-600 mx-auto">
          Lưu ý: CyStack không thể xem, không thể lưu trữ, cũng như không thể cấp lại Master Password trong trường hợp bạn quên hoặc đánh mất.
        </div>
      </div>
    </div>
  </BlankLayout>
</template>

<script>
import Vue from 'vue'
import PasswordStrengthBar from '@/components/password/PasswordStrengthBar'
import BlankLayout from '@/components/layout/blank'
export default Vue.extend({
  components: { BlankLayout, PasswordStrengthBar },
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
      await this.clearKeys()
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
        // default org
        // const shareKey = await this.$cryptoService.makeShareKey()
        // const orgKey = shareKey[0].encryptedString
        // const collection = await this.$cryptoService.encrypt('defaultCollection', shareKey[1])
        // const collectionName = collection.encryptedString
        await this.axios.post('cystack_platform/pm/users/register', {
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
