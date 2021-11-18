<template>
  <ListCipher :filter="c => c.folderId === $route.params.folderId" />
</template>

<script>
import Vue from 'vue'
import ListCipher from "@/popup/components/ciphers/ListCipher";
export default Vue.extend (
  {
    components: { ListCipher }
  }
)
</script>
