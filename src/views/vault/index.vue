<template>
  <ListCipher ref="listCipher" route-name="vault" />
</template>
<script>
import Vue from 'vue'
import ListCipher from '@/components/cipher/ListCipher'
export default Vue.extend({
  components: {
    ListCipher
  },
  mounted () {
    if(this.$route.query.add_item){
      let type = ''
      switch (this.$route.query.add_item) {
      case 'passwords':
        type =  'Login'
        break
      case 'notes':
        type = 'SecureNote'
        break
      case 'cards':
        type = 'Card'
        break
      case 'identities':
        type = 'Identity'
        break
      default:
        type = null
      }
      if(type){
        this.$refs.listCipher.$refs.chooseCipherType.confirmDialog(type)
      }
    }
  }
})
</script>
