<template>
  <div>
    <InputSelect
      v-if="!initialValue"
      :label="$t('common.option')"
      :initial-value="option"
      :options="options"
      @change="changeOption"
    />
    <InputSelect
      v-if="option === 'select' && !initialValue"
      :initial-value="notes"
      :label="$t('data.ciphers.otp.select_placeholder')"
      :required="true"
      :options="otps"
      :filterable="true"
      @change="changeOtp"
    />
    <InputText
      v-else-if="option === 'new' || initialValue"
      v-model="notes"
      :label="$t('data.ciphers.otp.secret_key')"
      :required="true"
      @input="changeOtp"
    />
    <div class="flex items-center justify-between mt-3">
      <div v-if="otp" class="flex items-center">
        <div
          class="mr-2"
          v-clipboard:copy="otp"
          v-clipboard:success="handleCopy"
        >
          <p class="text-head-5 text-primary font-bold">
            {{ formatOTP(otp) }}
          </p>
          <span v-if="isCopied" class="copied ml-3">{{ $t('data.otp.copied') }}!</span> 
        </div>
        <el-progress
          type="circle"
          color="#268334"
          :width="32"
          :show-text="false"
          :percentage="(start / period) * 100"
          :stroke-width="3"
        ></el-progress>
        <!-- Copy -->
        <button
          class="btn btn-icon btn-xs hover:bg-black-400"
          v-clipboard:copy="otp"
          v-clipboard:success="clipboardSuccessHandler"
        >
          <i class="far fa-clone" />
        </button>
        <!-- Copy end -->
      </div>
      <button
        v-if="initialValue"
        class="btn btn-icon !text-danger"
        @click="removeOtp"
      >
        <i class="fa fa-trash-alt" />
      </button>
    </div>
  </div>
</template>

<script>
import orderBy from 'lodash/orderBy'
import { CipherType } from "jslib-common/enums/cipherType";

import InputText from '@/components/input/InputText'
import InputSelect from '@/components/input/InputSelect'

export default {
  components: {
    InputText,
    InputSelect
  },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data () {
    return {
      option: null,
      notes: this.value,
      initialValue: this.value,
      otp: '',
      period: 30,
      now: new Date().getTime() / 1000,
      otpSearchText: '',
      isCopied: false,
      options: [
        {
          label: this.$t('data.ciphers.otp.no_otp'),
          value: null
        },
        {
          label: this.$t('data.otp.scan_qr'),
          value: 'scan_qr'
        },
        {
          label: this.$t('data.ciphers.otp.select'),
          value: 'select'
        },
        {
          label: this.$t('data.ciphers.otp.add_new'),
          value: 'new'
        },
      ]
    }
  },
  asyncComputed: {
    otps: {
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      async get () {
        let result = []
        try {
          const filter = c => c.type === CipherType.OTP
          result = await this.$searchService.searchCiphers(this.otpSearchText, [filter], null) || []
        } catch (error) {
          result = []
        }
        result = orderBy(result, [c => c.name && c.name.toLowerCase()], []) || []
        return result.map(r => ({
          label: r.name,
          value: r.notes
        }))
      },
      watch: [
        '$store.state.syncedCiphersToggle',
        'otpSearchText'
      ]
    }
  },

  computed: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    start () {
      return this.period - Math.floor(this.now) % this.period
    }
  },

  watch: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    start(value) {
      if (value === this.period) {
        this.getOTP();
      }
    }
  },

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  mounted () {
    this.changeOtp(this.value)
  },

  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getOTP () {
      if (this.notes) {
        this.otp = await this.$totpService.getCode(this.notes);
        this.period = await this.$totpService.getTimeInterval(this.notes);
      } else {
        this.otp = ''
        this.period = 30
      }
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    formatOTP (otp) {
      if (!otp) {
        return 'N/A'
      }
      const first = otp.slice(0, 3);
      const last = otp.slice(3, otp.length);
      return `${first} ${last}`
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    handleCopy () {
      this.isCopied = true;
      setTimeout(() => {
        this.isCopied = false;
      }, 1000);
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    getRemainingTime (period = 30) {
      return (period + 1) - Math.floor(new Date().getTime() / 1000) % period
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    changeOption (option) {
      this.option = option
      this.changeOtp(null)
      if (option === 'scan_qr') {
        this.scanQRCode(true)
      }
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    changeOtp (notes) {
      this.now = new Date().getTime() / 1000
      this.period = 30
      this.notes = notes
      this.$emit('change', notes)
      this.$emit('createNewOtp', !!notes && this.option === 'new')
      this.getOTP()
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    removeOtp () {
      this.initialValue = null
      this.now = new Date().getTime() / 1000
      this.period = 30
      this.notes = null
      this.$emit('change', null)
      this.$emit('createNewOtp', false)
      this.changeOption(null)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
