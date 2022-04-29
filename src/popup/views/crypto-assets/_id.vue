<template>
  <DetailCipher type="CryptoAsset" route-name="crypto-assets" />
</template>

<script>
import Vue from 'vue'
import DetailCipher from '@/popup/components/ciphers/DetailCipher'

export default Vue.extend ({
  components: {
    DetailCipher
  }
})
</script>
