<template>
  <div class="w-full px-10">
    <el-form :model="form">
      <el-form-item prop="username">
        <el-input
          v-model="form.username"
          :placeholder="$t('data.login.username_placeholder')"
        ></el-input>
      </el-form-item>
      <el-form-item
        prop="password"
        v-if="!isEnterprise"
      >
        <el-input
          type="password"
          v-model="form.password"
          :placeholder="$t('data.login.password_placeholder')"
        ></el-input>
      </el-form-item>
    </el-form>
    <el-row type="flex" align="middle" justify="space-between">
      <el-button
        type="text"
        icon="el-icon-back"
        @click="$emit('back')"
      >{{ $t(`common.back`) }}</el-button>
      <el-button
        type="primary"
        @click="handleLogin"
      >{{ $t(`data.login.sign_in`) }}</el-button>
    </el-row>
    
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {
    isEnterprise: Boolean
  },
  data () {
    return {
      form: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    handleLogin() {
      this.$emit('next')
    }
  }
})
</script>

<style scoped>
</style>
