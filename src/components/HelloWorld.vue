<template>
  <div>
    <p>{{ defaultText }}</p>
    <table class="outter-table">
      <tbody>
      <tr>
        <td>haha</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'HelloWorld',
  mounted () {
    browser.runtime.sendMessage({})
  },
  computed: {
    defaultText () {
      return browser.i18n.getMessage('extName')
    }
  }
})
</script>

<style scoped>
p {
  font-size: 20px;
}
</style>
