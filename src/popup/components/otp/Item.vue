<template>
  <div class="otp-item p-4">
    <el-row type="flex" justify="space-between">
      <div class="otp-item__left">
        <p class="name">Facebook (nguyendb@gmail.com)</p>
        <p class="value">392 834</p>
      </div>
      <div class="otp-item__right">
        <el-progress
          type="circle"
          color="#3A4BDE"
          :width="32"
          :show-text="false"
          :percentage="10"
          :stroke-width="3"
        ></el-progress>
      </div>
    </el-row>
  </div>
</template>

<script>
export default {
  components: { },
  data () {
    return {
      otps: [],
      textSearch: ''
    }
  },
  computed: {},
  mounted () {
    this.getOtps()
  },
  methods: {
    async getOtps () {},
    async handleSearch () {},
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
      color: #3A4BDE;
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
