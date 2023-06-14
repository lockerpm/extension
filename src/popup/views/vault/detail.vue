<template>
  <DetailCipher
    type="Card"
  />
</template>

<script>
import Vue from 'vue'
import DetailCipher from '@/popup/components/ciphers/DetailCipher'

export default Vue.extend ({
  components: {
    DetailCipher
  },
  computed: {
    type(){
      return Number(this.$route.params.type)
    },
  }
})
</script>
