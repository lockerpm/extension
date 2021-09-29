<template>
  <div class="home">
    <h1>This is SSO page</h1>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { BrowserApi } from '@/browser/browserApi'
export default Vue.extend({
  name: 'SSO',
  components: {
  },
  mounted() {
    this.$storageService.save('cs_token', this.$route.query.token)
    // BrowserApi.reloadOpenWindows();
    // const thisWindow = window.open('', '_self');
    // thisWindow.close();
  }
});
</script>
