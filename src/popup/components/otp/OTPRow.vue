<template>
  <div class="otp-item px-4 py-2">
    <el-row type="flex" justify="space-between">
      <el-row
        type="flex"
        justify="space-between"
        class="w-full"
        align="middle"
      >
        <div
          class="otp-item__left"
          v-clipboard:copy="otp"
          v-clipboard:success="handleCopy"
        >
          <p class="name text-black font-semibold truncate">{{ item.name }}</p>
          <p class="value">
            {{ formatOTP(otp) }}
            <span v-if="isCopied" class="copied ml-xl">{{ $t('data.otp.copied') }}!</span>
          </p> 
        </div>
        <el-progress
          type="circle"
          color="#268334"
          :width="32"
          :show-text="false"
          :percentage="(start / period) * 100"
          :stroke-width="3"
        ></el-progress>
      </el-row>
      <div class="otp-item__right">
        <el-dropdown trigger="click">
          <div class="icon flex items-center justify-center">
            <i class="el-icon-more"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-clipboard:copy="otp"
              v-clipboard:success="handleCopy"
            >
              {{ $t('data.otp.copy') }}
            </el-dropdown-item>
            <el-dropdown-item
              @click.native="$router.push({ name: 'add-edit-otp', params: { data: item } })"
            >
              {{ $t('common.edit') }}
            </el-dropdown-item>
            <el-dropdown-item
              class="text-danger"
              @click.native="deleteCiphers([item.id])"
            >
              {{ $t('common.delete') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-row>
  </div>
</template>

<script>

export default {
  components: { },
  props: {
    item: Object
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data () {
    return {
      otp: '',
      period: 30,
      now: new Date().getTime() / 1000,
      isCopied: false,
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
    this.getOTP();
    setInterval(() => {
      this.now = new Date().getTime() / 1000
    }, 1000);
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getOTP () {
      this.otp = await this.$totpService.getCode(this.item.notes);
      this.period = await this.$totpService.getTimeInterval(this.item.notes);
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
.otp-item {
  border-bottom: 1px solid #eaeaf5;
  &:last-child {
    border-bottom: none;
  }
  &:last-child {
    border: none;
  }
  &__left {
    cursor: pointer;
    .name {
      font-size: 12px;
    }
    .value {
      font-size: 18px;
      font-weight: 600;
      color: #268334;
      span {
        font-size: 12px;
        font-weight: 400;
        color: #6F6F6F;
      }
    }
  }
  &__right {
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .el-icon-more {
      font-size: 20px;
    }
  }
}
</style>
