<template>
  <ListCipher route-name="trash" :deleted="true" />
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
