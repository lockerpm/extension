<template>
  <DetailCipher type="Identity" route-name="identities" />
</template>

<script>
import Vue from 'vue'
import DetailCipher from '@/components/cipher/DetailCipher'
export default Vue.extend({
  components: {
    DetailCipher
  }
}
)
</script>
