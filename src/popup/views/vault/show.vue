<template>
  <div>
    <AddEditCipher
      :type="type"
      :password="password"
      :data="data"
    />
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
      return Number(this.$route.params.type)
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
