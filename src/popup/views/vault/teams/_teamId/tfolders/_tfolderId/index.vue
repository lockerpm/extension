<template>
  <ListCipher
    :filter="c => c.organizationId === $route.params.teamId && ($route.params.tfolderId === 'unassigned' ? c.collectionIds.length === 0 : c.collectionIds.includes($route.params.tfolderId))"
  />
</template>

<script>
import Vue from 'vue'
import ListCipher from "@/popup/components/ciphers/ListCipher";
export default Vue.extend ({
  components: { ListCipher }
})
</script>
