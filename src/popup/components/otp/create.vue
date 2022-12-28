<template>
  <div class="create-otp p-4">
    <div class="text-left bg-white p-4" style="border-radius: 16px">
      <h1 class="create-otp__title text-black-700 text-head-6 font-semibold">
        Input secret key manually
      </h1>
      <el-form class="create-otp__form" ref="form" :model="form">
        <el-form-item label="Title">
          <el-input v-model="form.title"></el-input>
        </el-form-item>
        <el-form-item label="Secret key">
          <el-input
            v-model="form.secretKey"
            type="password"
          >
            <i class="el-icon-view" slot="suffix"></i>
          </el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="create-otp__btn mt-4">
      <el-row type="flex" justify="space-between">
        <div
          class="menu-icon mr-4 cursor-pointer"
          @click="$emit('close')"
        >
          {{$t('common.cancel')}}
        </div>
        <button
          class="btn btn-primary"
          style="border-radius: 100px !important; padding: 10px 24px !important"
        >
          {{ $t('common.save') }}
        </button>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  components: { },
  data () {
    return {
      form: {
        title: '',
        secretKey: '',
      }
    }
  },
  computed: {},
  methods: {}
}
</script>
<style lang="scss">
.create-otp {
  border-top: 1px solid #e5e7eb;
  position: relative;
  height: 100%;
  background-color: #f6f6f6;
  &__form {
    .el-input {
      &__inner {
        border-radius: 8px;
      }
      .el-icon-view {
        font-size: 18px;
        color: #374151;
        cursor: pointer;
      }
    }
  }
}
</style>
