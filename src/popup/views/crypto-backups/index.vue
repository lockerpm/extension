<template>
  <div
    class="p-4 text-[#A2A3A7]"
    style="padding-top: 180px; padding-bottom: 56px;"
  >
    <ListCipher
      :filter="c => c.type === 6 || c.type === 7"
      route-name="crypto-backups"
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
