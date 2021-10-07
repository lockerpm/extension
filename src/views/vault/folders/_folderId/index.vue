<template>
  <ListCipher :filter="c => c.folderId === $route.params.folderId" route-name="vault" />
</template>

<script>
import Vue from 'vue'
import ListCipher from '@/components/cipher/ListCipher'
export default Vue.extend({
  components: { ListCipher }
})
</script>
