<template>
  <div>
    <PasswordGenerator />
  </div>
</template>

<script>
import Vue from 'vue'
import PasswordGenerator from '@/popup/components/password/PasswordGenerator'
export default Vue.extend({
  components: { PasswordGenerator }
})
</script>

<style lang="scss" scoped>

</style>
