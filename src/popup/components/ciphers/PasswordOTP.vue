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
      is-password
      :label="$t('data.ciphers.otp.secret_key')"
      :required="true"

      @input="changeOtp"
    />
    <div class="flex items-center justify-between">
      <ShowOTP
        v-if="notes"
        :notes="notes"
        :show-copy="true"
      />
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
import ShowOTP from '@/popup/components/otp/ShowOTP.vue'

export default {
  components: {
    InputText,
    InputSelect,
    ShowOTP
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
      otpSearchText: '',
      option: null,
      notes: this.value,
      initialValue: this.value,
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

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  mounted () {
    this.changeOtp(this.value)
  },

  methods: {
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
      this.notes = notes
      this.$emit('change', notes)
      this.$emit('createNewOtp', !!notes && ['new', 'scan_qr'].includes(this.option))
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    removeOtp () {
      this.initialValue = null
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
