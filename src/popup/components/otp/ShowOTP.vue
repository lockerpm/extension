<template>
  <el-row
    type="flex"
    class="w-full"
    align="middle"
    :justify="justify"
  >
    <div
      class="otp-show mr-2"
      v-clipboard:copy="otp"
      v-clipboard:success="handleCopy"
    >
      <p v-if="name" class="name text-black font-semibold truncate">
        {{ name }}
      </p>
      <p class="value">
        {{ formatOTP(otp) }}
        <span v-if="isCopied" class="copied ml-xl">
          {{ $t('data.otp.copied') }}!
      </span>
      </p> 
    </div>
    <el-progress
      type="circle"
      color="#268334"
      :width="32"
      :show-text="false"
      :percentage="(start / period) * 100"
      :stroke-width="3"
    />
    <button
      v-if="showCopy"
      class="ml-2 btn btn-icon btn-xs hover:bg-black-400"
      v-clipboard:copy="otp"
      v-clipboard:success="clipboardSuccessHandler"
    >
      <i class="far fa-clone" />
    </button>
  </el-row>
</template>

<script>

export default {
  components: { },
  props: {
    name: {
      type: String,
      default: ''
    },
    justify: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    },
    showCopy: {
      type: Boolean,
      default: false
    },
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data () {
    return {
      otp: '',
      period: 30,
      now: new Date().getTime() / 1000,
      isCopied: false
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
    },

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    notes() {
      this.period = 30;
      this.now = new Date().getTime() / 1000
      this.getOTP();
    }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  mounted () {
    this.getOTP();
    setInterval(() => {
      this.now = new Date().getTime() / 1000
    }, 1000);
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getOTP () {
      this.otp = await this.$totpService.getCode(this.notes);
      this.period = await this.$totpService.getTimeInterval(this.notes);
      this.$emit('change', this.otp)
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
  }
}
</script>
<style lang="scss">
.otp-show {
  cursor: pointer;
  .name {
    font-size: 12px;
  }
  .value {
    font-size: 20px;
    font-weight: 600;
    color: #268334;
    span {
      font-size: 12px;
      font-weight: 400;
      color: #6F6F6F;
    }
  }
}
</style>
