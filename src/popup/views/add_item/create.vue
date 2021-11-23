<template>
  <div>
    <AddEditCipher :type="type"></AddEditCipher>
  </div>
</template>

<script>
import Vue from 'vue'
import AddEditCipher from '@/popup/components/ciphers/AddEditCipher'
export default Vue.extend({
  components: {
    AddEditCipher
  },
  computed: {
    type(){
      return this.$route.params.type
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
