<template>
  <div id="password-generator">
    <div class="p-4">
      <div class="flex items-center justify-between mb-1 generated-password-container">
        <div class="generated-password text-head-6 flex-grow truncate leading-[1.25rem]">
          {{ password }}
        </div>
        <div class="ml-2">
          <button
            class="btn btn-icon btn-default w-8 h-8 !rounded-full flex items-center justify-center"
            @click="regenerate"
          >
            <i class="fas fa-redo-alt" />
          </button>
        </div>
      </div>
      <PasswordStrength
        v-if="password"
        :score="passwordStrength.score"
      />
      <button
        v-clipboard:copy="password"
        v-clipboard:success="clipboardSuccessHandler"
        class="btn btn-primary w-full mt-4"
      >
        {{ $t('data.tools.copy_password') }}
      </button>
      <button
        class="btn btn-primary-reserve w-full mt-2"
        @click="savePassword"
      >
        {{ $t('data.tools.save_with_locker') }}
      </button>
    </div>
    <div class="password-generator-options">
      <div class="generator-option">
        <div class="text-black font-semibold -mb-2">{{ $t('common.length') }}</div>
        <el-slider
          v-model="options.length"
          :min="8"
          :max="64"
          :debounce="800"
          @change="regenerate"
        />
      </div>
      <el-checkbox
        v-model="options.uppercase"
        class="generator-option"
        @change="regenerate"
      >
        {{ $t('data.tools.uppercase') }}
      </el-checkbox>
      <el-checkbox
        v-model="options.lowercase"
        class="generator-option"
        @change="regenerate"
      >
        {{ $t('data.tools.lowercase') }}
      </el-checkbox>
      <el-checkbox
        v-model="options.number"
        class="generator-option"
        @change="regenerate"
      >
        {{ $t('data.tools.digits') }}
      </el-checkbox>
      <el-checkbox
        v-model="options.special"
        class="generator-option"
        @change="regenerate"
      >
        {{ $t('data.tools.symbols') }}
      </el-checkbox>
      <el-checkbox
        v-model="options.ambiguous"
        class="generator-option"
        @change="regenerate"
      >
        {{ $t('data.tools.ambiguous') }}
      </el-checkbox>
    </div>
  </div>
</template>

<script>
import PasswordStrength from './PasswordStrength'
import { BrowserApi } from "@/browser/browserApi";
import { CipherRequest } from 'jslib-common/models/request/cipherRequest'
export default {
  components: { PasswordStrength },
  data () {
    return {
      password: '',
      options: {
        length: 16,
        uppercase: true,
        lowercase: true,
        number: true,
        special: true,
        ambiguous: false
      },
      toggle: false
    }
  },
  computed: {
    passwordStrength () {
      if (this.password) {
        return this.$passwordGenerationService.passwordStrength(this.password, ['cystack']) || {}
      }
      return {}
    }
  },
  mounted () {
    this.regenerate(false)
  },
  methods: {
    async regenerate (isReset = true) {
      const oldGeneratePassword = await this.$passService.getGeneratePassword()
      if (oldGeneratePassword) {
        this.password = oldGeneratePassword.password
        this.options = oldGeneratePassword.options
      }
      if (!this.options.lowercase && !this.options.uppercase && !this.options.lowercase && !this.options.number && !this.options.special) {
        this.options.lowercase = true
      }
      if (isReset) {
        this.password = await this.$passwordGenerationService.generatePassword(this.options)
        const tab = await BrowserApi.getTabFromCurrentWindow();
        await this.$passService.setInformation(this.password, this.options, tab)
      }
    },
    async savePassword () {
      this.$router.push({ name: 'add-item-create', params: { password: this.password } })
    },
    padNumber (num, width, padCharacter = '0') {
      const numString = num.toString()
      return numString.length >= width
        ? numString
        : new Array(width - numString.length + 1).join(padCharacter) + numString
    },
    async postCipher (cipher) {
      if (!cipher.name) { return }
      try {
        this.loading = true
        this.errors = {}
        const cipherEnc = await this.$cipherService.encrypt(cipher)
        const data = new CipherRequest(cipherEnc)
        await this.axios.post('cystack_platform/pm/ciphers/vaults', {
          ...data,
          score: this.passwordStrength.score
        })
        this.notify(this.$tc('data.notifications.create_success', 1, { type: this.$tc(`type.${cipher.type}`, 1) }), 'success')
      } catch (e) {
        this.notify(this.$tc('data.notifications.create_failed', 1, { type: this.$tc(`type.${cipher.type}`, 1) }), 'warning')
        this.errors = (e.response && e.response.data && e.response.data.details) || {}
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
<style>
.generator-option {
  @apply w-full py-2;
  margin-right: 0 !important;
}
</style>
