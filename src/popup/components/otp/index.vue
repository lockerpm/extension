<template>
  <div class="list-otp">
    <el-input
      v-model="textSearch"
      class="list-otp__search"
      prefix-icon="el-icon-search"
      :placeholder="$t('data.parts.search')"
      @input="handleSearch"
    >
    </el-input>
    <div class="list-otp__container">
      <el-row
        class="list-otp__container--sort p-4"
        type="flex"
        justify="space-between"
      >
        <span>Sort by: <b>Most Recent</b></span>
        <div class="right-icon">
          <el-dropdown>
            <i class="el-icon-more"></i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>A - Z</el-dropdown-item>
              <el-dropdown-item>Most recent</el-dropdown-item>
              <el-dropdown-item>Custom</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-row>
      <OtpItem v-for="item in 4"/>
    </div>
    <div class="list-otp__add">
      <el-dropdown @command="handleCreateOTP">
        <div class="icon flex items-center justify-center">
          <i class="el-icon-plus"></i>
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="scan-qr">Scan QR code</el-dropdown-item>
          <el-dropdown-item command="setup-key">Enter setup key</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import OtpItem from './Item.vue'
export default {
  name: 'ListOTP',
  components: { OtpItem },
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
    handleCreateOTP (command) {
      if (command === 'setup-key') {
        this.$emit('create');
      }
    },
    async getOtps () {},
    async handleSearch () {},
  }
}
</script>
<style lang="scss">
.list-otp {
  position: relative;
  &__search {
    position: fixed;
    top: 98px !important;
    left: 0;
    width: 100%;
    z-index: 1;
    .el-input {
      &__inner {
        border-left: none;
        border-right: none;
        border-radius: 0 !important;
        &:focus {
          border-color: #E6E6E8 !important;
        }
      }
    }
  }
  &__container {
    position: absolute;
    top: 40px;
    left: 0;
    width: 100%;
    z-index: 0;
    padding-bottom: 64px;
    .right-icon {
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      i {
        cursor: pointer;
        font-size: 20px;
        color: #6F6F6F;
      }
    }
  }
  &__add {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 3;
    .icon {
      width: 40px;
      height: 40px;
      background-color: #268334;
      border-radius: 50%;
      cursor: pointer;
    }
    
    i {
      font-size: 28px;
      color: #fff;
    }
  }
}
</style>
