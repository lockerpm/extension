<template>
  <div>
    <AddEditCipher :type="type" :password="password"></AddEditCipher>
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
    },
    password(){
      return this.$route.params.password
    },
  }
})
</script>

<style lang="scss" scoped>

</style>
