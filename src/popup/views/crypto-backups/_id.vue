<template>
  <DetailCipher type="CryptoBackup" route-name="crypto-backups" />
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
