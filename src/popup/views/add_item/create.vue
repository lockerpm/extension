<template>
  <div>
    <AddEditCipher :type="type" :password="password" :data="data"></AddEditCipher>
  </div>
</template>

<script>
import Vue from 'vue'
import AddEditCipher from '@/popup/components/ciphers/AddEditCipher'
export default Vue.extend({
  components: {
    AddEditCipher
  },
  mounted() {
    console.log(this.type)
  },
  computed: {
    type(){
      return this.$route.params.type
    },
    password(){
      return this.$route.params.password
    },
    data() {
      return this.$route.params.data
    },
  }
})
</script>

<style lang="scss" scoped>

</style>
