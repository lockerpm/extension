<template>
  <div class="show-body">
    <div class="p-4">
      <ListCipher
        :folder-id="$route.params.id"
      />
    </div>
  </div>
</template>

<script>
import find from 'lodash/find'
import ListCipher from "@/popup/components/ciphers/ListCipher";
export default {
  scrollToTop: true,
  components: {
    ListCipher
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data () {
    return {
      folders: []
    }
  },
  asyncComputed: {
    folders: {
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      async get () {
        let folders = (await this.$folderService.getAllDecrypted()) || [];
        folders = folders.filter((f) => f.id);
        return folders;
      },
      watch: ["ciphers"],
    },
  },
  computed: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    folder () {
      if (this.folders) {
        return find(this.folders, e => e.id === this.$route.params.folderId) || {}
      }
      return {}
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
