<template>
  <div class="otp-item p-4">
    <el-row type="flex" justify="space-between">
      <div class="otp-item__left">
        <p class="name">{{ item.name }}</p>
        <p class="value">{{ otp }}</p>
      </div>
      <div class="otp-item__right">
        <el-progress
          type="circle"
          color="#268334"
          :width="32"
          :show-text="false"
          :percentage="(start / period) * 100"
          :stroke-width="3"
        ></el-progress>
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
  data () {
    return {
      otp: '',
      period: 30,
      now: new Date().getTime() / 1000,
    }
  },
  computed: {
    start () {
      return this.period - Math.floor(this.now) % this.period
    }
  },
  watch: {
    start(value) {
      console.log(value);
      if (value === this.period) {
        this.getOTP();
      }
    }
  },
  mounted () {
    this.getOTP();
    setInterval(() => {
      this.now = new Date().getTime() / 1000
    }, 1000);
  },
  methods: {
    async getOTP () {
      this.otp = await this.$totpService.getCode(this.item.notes);
      this.period = await this.$totpService.getTimeInterval(this.item.notes);
    },
  }
}
</script>
<style lang="scss">
.otp-item {
  cursor: pointer;
  border-bottom: 1px solid #e5e7eb;
  &:hover {
    background-color: #f3f4f6;
  }
  &:last-child {
    border: none;
  }
  &__left {
    .name {
      font-size: 12px;
      font-weight: 400;
      color: #6F6F6F;
    }
    .value {
      font-size: 18px;
      font-weight: 600;
      color: #268334;
    }
  }
  &__right {
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
