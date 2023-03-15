<template>
  <div style="padding-top: 110px; padding-bottom: 56px;">
    <div
      class="grid grid-cols-3 bg-white px-4 pb-4 fixed top-0"
      style="z-index: 1; width: 400px; padding-top: 24px; align-items: center"
    >
      <div
        class="menu-icon cursor-pointer"
        @click="$router.back()"
      >
        <i class="fas fa-arrow-left text-[20px]"></i>
      </div>
      <div class="text-center text-head-6 font-semibold">
        <img src="@/assets/images/icons/icon_folder.svg" class="mx-auto" style="border-radius: 50%">
        {{folder.name}}
      </div>
    </div>
    <div class="p-4">
      <ListCipher
        :filter="c => c.folderId === $route.params.folderId"
        route-name="vault"
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
  data () {
    return {
      folders: []
    }
  },
  asyncComputed: {
    folders: {
      async get () {
        let folders = (await this.$folderService.getAllDecrypted()) || [];
        folders = folders.filter((f) => f.id);
        return folders;
      },
      watch: ["ciphers"],
    },
  },
  computed: {
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
