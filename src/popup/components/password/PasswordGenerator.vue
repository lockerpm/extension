<template>
  <div id="password-generator" class="p-4">
    <div>
      <div class="flex items-center justify-between mb-1 generated-password-container">
        <div class="generated-password text-head-6 flex-grow truncate leading-[1.25rem]">
          {{ password }}
        </div>
        <div>
          <el-button
            circle
            plain
            type="primary"
            size="mini"
            @click="regenerate()"
          >
            <i class="fas fa-redo-alt" />
          </el-button>
        </div>
      </div>
      <div class="flex justify-end">
        <PasswordStrength
          v-if="password"
          :score="passwordStrength.score"
        />
      </div>
      <div v-if="isOver">
        <div class="mt-2">
          <el-button
            type="primary"
            class="w-full"
            @click="handleUsePassword"
          >
            {{ $t('menu.use_this_password') }}
          </el-button>
        </div>
      </div>
      <div v-else>
        <div class="mt-2">
          <el-button
            v-clipboard:copy="password"
            v-clipboard:success="clipboardSuccessHandler"
            type="primary"
            class="w-full"
          >
            {{ $t('data.tools.copy_password') }}
          </el-button>
        </div>
        <div v-if="$route.name === 'add-edit-cipher'" class="mt-2">
          <el-button
            type="primary"
            class="w-full"
            plain
            @click="formUsePassword"
          >
            {{ $t('menu.use_this_password') }}
          </el-button>
        </div>
        <div v-else class="mt-2">
          <el-button
            class="w-full"
            type="primary"
            plain
            @click="savePassword"
          >
            {{ $t('data.tools.save_with_locker') }}
          </el-button>
        </div>
      </div>
    </div>
    <div>
      <div class="generator-option">
        <div class="text-black font-semibold -mb-2">{{ $t('common.length') }}</div>
        <el-slider
          v-model="options.length"
          :min="8"
          :max="64"
          :debounce="800"
          @change="regenerate()"
        />
      </div>
      <el-checkbox
        v-model="options.uppercase"
        class="generator-option"
        @change="regenerate()"
      >
        {{ $t('data.tools.uppercase') }}
      </el-checkbox>
      <el-checkbox
        v-model="options.lowercase"
        class="generator-option"
        @change="regenerate()"
      >
        {{ $t('data.tools.lowercase') }}
      </el-checkbox>
      <el-checkbox
        v-model="options.number"
        class="generator-option"
        @change="regenerate()"
      >
        {{ $t('data.tools.digits') }}
      </el-checkbox>
      <el-checkbox
        v-model="options.special"
        class="generator-option"
        @change="regenerate()"
      >
        {{ $t('data.tools.symbols') }}
      </el-checkbox>
      <el-checkbox
        v-model="options.ambiguous"
        class="generator-option"
        @change="regenerate()"
      >
        {{ $t('data.tools.ambiguous') }}
      </el-checkbox>
    </div>
  </div>
</template>

<script>
import PasswordStrength from './PasswordStrength'
import { BrowserApi } from "@/browser/browserApi";
import { CipherRequest } from 'jslib-common/models/request/cipherRequest';
import { CipherType } from "jslib-common/enums/cipherType";

import cystackPlatformAPI from '@/api/cystack_platform';

export default {
  components: { PasswordStrength },
  props: {
    isOver: {
      type: Boolean,
      default: false
    }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    passwordStrength () {
      if (this.password) {
        return this.$passwordGenerationService.passwordStrength(this.password, ['cystack']) || {}
      }
      return {}
    }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  mounted () {
    this.regenerate(true)
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async regenerate (isReload = false) {
      const oldGeneratePassword = await this.$passService.getGeneratePassword()
      if (isReload && oldGeneratePassword) {
        this.password = oldGeneratePassword.password
        this.options = JSON.parse(oldGeneratePassword.options)
      } else {
        if (!this.options.lowercase && !this.options.uppercase && !this.options.number && !this.options.special) {
          this.options.lowercase = true
        }
        this.password = await this.$passwordGenerationService.generatePassword(this.options)
        const tab = await BrowserApi.getTabFromCurrentWindow();
        await this.$passService.setInformation(this.password, this.options, tab)
      }
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async formUsePassword () {
      this.$emit('fill-password', this.password)
      this.$emit('toggle', false)
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async savePassword () {
      this.$router.replace({ name: 'add-edit-cipher', params: { password: this.password } }).catch(() => ({}))
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    padNumber (num, width, padCharacter = '0') {
      const numString = num.toString()
      return numString.length >= width
        ? numString
        : new Array(width - numString.length + 1).join(padCharacter) + numString
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async postCipher (cipher) {
      if (!cipher.name) { return }
      try {
        this.loading = true
        this.errors = {}
        const cipherEnc = await this.$cipherService.encrypt(cipher)
        const data = new CipherRequest(cipherEnc)
        await cystackPlatformAPI.create_ciphers_vault({
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
    },

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async handleUsePassword () {
      this.fillCipher({ type: CipherType.Login,  login: { password: this.password } })
    }
  }
}
</script>
<style>
.generator-option {
  @apply w-full pt-2;
  margin-right: 0 !important;
}
</style>
