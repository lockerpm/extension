<template>
  <div class="p-4 text-[#A2A3A7] vault-body">
    <ListCipher
      :filter="c => c.type === CipherType['SecureNote']"
      route-name="notes"
    />
  </div>
</template>

<script>
import Vue from 'vue'
import ListCipher from "@/popup/components/ciphers/ListCipher";
import { CipherType } from "jslib-common/enums/cipherType";
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
