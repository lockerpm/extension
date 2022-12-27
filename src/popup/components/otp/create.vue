<template>
  <div class="create-otp p-4">
    <h1 class="create-otp__title">
      Input secret key manually
    </h1>
    <el-form class="create-otp__form" ref="form" :model="form">
      <el-form-item label="Title">
        <el-input v-model="form.title"></el-input>
      </el-form-item>
      <el-form-item label="Secret key">
        <el-input  v-model="form.secretKey"></el-input>
      </el-form-item>
    </el-form>
    <div class="create-otp__btn">
      <el-row type="flex" align="middle" justify="center">
        <el-button type="info">Cancel</el-button>
        <el-button type="primary">Save</el-button>
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
  mounted () {},
  methods: {}
}
</script>
<style lang="scss">
.create-otp {
  border-top: 1px solid #e5e7eb;
}
</style>
