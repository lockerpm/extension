<template>
  <div id="password-generator">
    <!-- <div class="uppercase px-3 mt-4 mb-3">{{$t('data.tools.password_generator_desc')}}</div> -->
    <div class="p-4 mt-3">
      <div class="flex items-center justify-between mb-1 generated-password-container">
        <div class="generated-password text-head-6 flex-grow truncate leading-[1.25rem]">
          {{ password }}
        </div>
        <div class="ml-4">
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
        style="border-radius: 64px !important"
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
    <!-- <div class="mt-4 mb-8">
      <button
        v-clipboard:copy="password"
        v-clipboard:success="clipboardSuccessHandler"
        class="btn btn-primary w-full"
      >
        {{ $t('data.tools.copy_password') }}
      </button>
      <button class="btn btn-clean w-full" @click="toggle = !toggle">
        {{ $t('data.tools.show_options') }} <i class="fa fa-chevron-down" />
      </button>
    </div> -->
    <!-- <div class="uppercase px-3 mb-3">{{ $t('data.tools.password_options') }}</div> -->
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
import { CipherView } from 'jslib-common/models/view/cipherView'
import PasswordStrength from './PasswordStrength'
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
    this.regenerate()
  },
  methods: {
    async regenerate () {
      if (!this.options.lowercase && !this.options.uppercase && !this.options.lowercase && !this.options.number && !this.options.special) {
        this.options.lowercase = true
      }
      this.password = await this.$passwordGenerationService.generatePassword(this.options)
      // this.$emit('generated', this.password)
    },
    async savePassword () {
      // let cipher = new CipherView()
      // cipher.login.password = this.password
      // cipher.type = 1
      // const now = new Date()
      // const dateString =
      //   now.getFullYear() + '' + this.padNumber(now.getMonth() + 1, 2) + '' + this.padNumber(now.getDate(), 2) +
      //   this.padNumber(now.getHours(), 2) + '' + this.padNumber(now.getMinutes(), 2) +
      //   this.padNumber(now.getSeconds(), 2)
      // cipher.name = 'password_' + dateString
      // await this.postCipher(cipher)
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
        // this.notify(e, 'warning')
      } finally {
        this.loading = false
        // this.$router.back()
      }
    }
  }
}
</script>
<style>
.generator-option {
  @apply mb-2 w-full py-2;
}
</style>