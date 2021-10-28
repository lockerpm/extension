<template>
  <div>
    <button class="btn btn-primary"
            @click="openLogin"
    >Đăng nhập</button>
  </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  methods: {
    openLogin () {
      const url = `${process.env.VUE_APP_ID_URL}/login?SERVICE_URL=${encodeURIComponent('/sso')}&SERVICE_SCOPE=pwdmanager&CLIENT=browser`
      this.$platformUtilsService.launchUri(url)
    }
  }
})
</script>
