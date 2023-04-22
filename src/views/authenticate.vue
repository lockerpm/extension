<template>
  <div class="home">
    <h1>This is Authenticate page</h1>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import isString from "lodash/isString";
export default Vue.extend({
  components: {
  },
  mounted() {
    this.$storageService.save('cs_token', this.$route.query.token)
    this.$store.commit('UPDATE_IS_LOGGEDIN', true)
    if (this.$route.query.return_url && isString(this.$route.query.return_url)) {
      this.$router.replace({ path: this.$route.query.return_url })
    } else {
      this.$router.replace({ name: 'vault' })
    }
    this.$store.commit('UPDATE_LOADING', false)
  }
});
</script>
