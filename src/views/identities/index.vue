<template>
  <ListCipher route-name="identities" :filter="c => c.type === CipherType['Identity']" />
</template>

<script>
import Vue from 'vue'
import ListCipher from '@/components/cipher/ListCipher'
import {CipherType} from "jslib-common/enums/cipherType";
export default Vue.extend({
  components: {
    ListCipher
  },
  data () {
    return {
      CipherType
    }
  }
})
</script>
