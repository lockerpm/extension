<template>
  <div>
    <div class="p-5 bg-[#F5F6F7]">
      <div class="flex items-center justify-between mb-8">
        <div class="text-[20px] flex-grow truncate leading-[2rem]">
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
      <PasswordStrength v-if="password" :score="passwordStrength.score" />
    </div>
    <div class="p-5">
      <button class="btn btn-outline-primary w-full mb-3" @click="fill">
        {{ $t('data.tools.fill_password') }}
      </button>
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
      <div v-if="toggle" class="locker-pw-generator-options">
        <div>
          <div class="text-black font-semibold -mb-2">{{ $t('common.length') }}</div>
          <el-slider
            v-model="options.length"
            :min="8"
            :max="64"
            :debounce="800"
            @change="regenerate"
          />
          <el-checkbox
            v-model="options.uppercase"
            class="mb-2"
            @change="regenerate"
          >
            {{ $t('data.tools.uppercase') }}
          </el-checkbox>
          <el-checkbox
            v-model="options.lowercase"
            class="mb-2"
            @change="regenerate"
          >
            {{ $t('data.tools.lowercase') }}
          </el-checkbox>
          <el-checkbox
            v-model="options.number"
            class="mb-2"
            @change="regenerate"
          >
            {{ $t('data.tools.digits') }}
          </el-checkbox>
          <el-checkbox
            v-model="options.special"
            class="mb-2"
            @change="regenerate"
          >
            {{ $t('data.tools.symbols') }}
          </el-checkbox>
          <el-checkbox
            v-model="options.ambiguous"
            class="mb-2"
            @change="regenerate"
          >
            {{ $t('data.tools.ambiguous') }}
          </el-checkbox>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import PasswordStrength from './PasswordStrength'
export default Vue.extend({
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
    },
    fill () {
      this.$emit('fill-password', this.password)
    }
  }
}
)
</script>
