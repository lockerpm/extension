<template>
  <DetailCipher />
</template>

<script>
import Vue from 'vue'
import DetailCipher from '@/popup/components/ciphers/DetailCipher'

export default Vue.extend ({
  components: {
    DetailCipher
  },
  computed: {
  },
  beforeMount() {
    if (!this.$route.params?.id && this.$route.name !== 'vault') {
      this.$router.push({ name: 'vault' })
    }
  }
})
</script>
