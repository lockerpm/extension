<template>
  <ListCipher
    :filter="c => c.organizationId === $route.params.teamId && ($route.params.tfolderId === 'unassigned' ? c.collectionIds.length === 0 : c.collectionIds.includes($route.params.tfolderId))"
    route-name="vault"
  />
</template>

<script>
import ListCipher from '../../../../../../components/cipher/ListCipher'

export default {
  components: { ListCipher }
}
</script>
