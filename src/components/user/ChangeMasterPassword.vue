<template>
  <el-dialog
    :visible.sync="dialogVisible"
    width="575px"
    destroy-on-close
    top="5vh"
    custom-class="locker-dialog"
    :close-on-click-modal="false"
  >
    <div slot="title">
      <div class="text-head-5 text-black-700 font-semibold truncate">
        {{ $t('master_password.change') }}
      </div>
    </div>
    <div class="text-left">
      <InputText
        v-model="oldMasterPassword"
        :label="$t('master_password.current_password')"
        class="w-full"
        :error-text="errors.oldMasterPassword && $t('errors.invalid_password')"
        is-password
        @change="errors = {}"
      />
      <InputText
        v-model="masterPassword"
        :label="$t('master_password.new_password')"
        class="w-full"
        :error-text="errors.masterPassword && $t('errors.confirm_password')"
        is-password
        @change="errors = {}"
      />
      <PasswordStrengthBar v-if="masterPassword" :score="passwordStrength.score" class="mb-4" />
      <InputText
        v-model="masterRePassword"
        :label="$t('master_password.re_password')"
        class="w-full"
        :error-text="errors.masterRePassword && $t('errors.confirm_password')"
        is-password
        @change="errors = {}"
      />
    </div>
    <div slot="footer" class="dialog-footer flex items-center text-left">
      <div class="flex-grow" />
      <div>
        <button
          class="btn btn-default"
          @click="dialogVisible = false"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          class="btn btn-primary"
          :disabled="loading || !oldMasterPassword || !masterRePassword || !masterPassword"
          @click="changePass"
        >
          {{ $t('master_password.change_btn') }}
        </button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import InputText from '@/components/input/InputText'
import PasswordStrengthBar from '@/components/password/PasswordStrengthBar'

import cystackPlatformAPI from '@/api/cystack_platform'

export default Vue.extend({
  components: { PasswordStrengthBar, InputText },
  data () {
    return {
      folder: {},
      loading: false,
      dialogVisible: false,
      errors: {},
      redirect: false,
      shouldRedirect: false,
      writeableCollections: [],
      oldMasterPassword: '',
      masterPassword: '',
      masterRePassword: '',
      key: '',
      showPassword: false
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
    openDialog (folder = {}, shouldRedirect = false) {
      this.dialogVisible = true
      this.shouldRedirect = shouldRedirect
      this.folder = { ...folder }
    },
    closeDialog () {
      this.dialogVisible = false
    },
    async changePass () {
      try {
        this.loading = true
        const kdf = 0
        const kdfIterations = 100000
        const key = await this.$cryptoService.makeKey(this.masterPassword, this.currentUser.email,
          kdf, kdfIterations)
        const newMasterPasswordHash = await this.$cryptoService.hashPassword(this.masterPassword, key)
        let encKey = null
        const existingEncKey = await this.$cryptoService.getEncKey()
        if (existingEncKey == null) {
          encKey = await this.$cryptoService.makeEncKey(key)
        } else {
          encKey = await this.$cryptoService.remakeEncKey(key)
        }

        const masterPasswordHash = await this.$cryptoService.hashPassword(this.oldMasterPassword, null)

        await cystackPlatformAPI.users_me_password({
          key: encKey[1].encryptedString,
          new_master_password_hash: newMasterPasswordHash,
          master_password_hash: masterPasswordHash
        })

        this.notify(this.$t('data.notifications.update_master_success'), 'success')
        this.closeDialog()
        await this.$userService.clear()
        await this.$messagingService.send('locked')
      } catch (e) {
        this.notify(this.$t('data.notifications.update_master_failed'), 'warning')
        this.errors = (e.response && e.response.data && e.response.data.details) || { oldMasterPassword: 1 }
      } finally {
        this.loading = false
      }
    }
  }
})
</script>
