<template>
  <ListCipher route-name="shares" :filter="c => c.organizationId" />
</template>

<script>
import Vue from 'vue'
import ListCipher from '@/components/cipher/ListCipher'
export default Vue.extend({
  components: {
    ListCipher
  }
})
</script>
