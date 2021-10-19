<template>
  <ListCipher :filter="c => c.type === CipherType['Login']" />
</template>

<script>
import Vue from 'vue'
import ListCipher from "@/popup/components/ciphers/ListCipher";
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
