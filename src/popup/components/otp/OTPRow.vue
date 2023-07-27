<template>
  <div
    class="otp-item px-4 py-2"
  >
    <el-row type="flex" justify="space-between">
      <ShowOTP
        justify="space-between"
        :name="item.name"
        :notes="item.notes"
        @change="(v) => otp = v"
      />
      <div
        class="otp-item__right"
      >
        <el-dropdown
          trigger="hover"
        >
          <div class="icon flex items-center justify-center">
            <i class="el-icon-more"></i>
          </div>
          <el-dropdown-menu
            slot="dropdown"
          >
            <el-dropdown-item
              v-clipboard:copy="otp"
              v-clipboard:success="handleCopy"
            >
              {{ $t('data.otp.copy') }}
            </el-dropdown-item>
            <el-dropdown-item
              @click.native="$emit('edit-otp')"
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
import ShowOTP from './ShowOTP.vue'
export default {
  components: { ShowOTP },
  props: {
    item: Object
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data () {
    return {
      otp: ''
    }
  },
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
