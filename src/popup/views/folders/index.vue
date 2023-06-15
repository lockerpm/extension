<template>
  <div
    class="vault-body px-4 pb-4"
    v-loading="$store.state.syncing"
  >
    <NoCipher
      v-if="folders && !folders.length && !$store.state.syncing"
      :type="0"
      @add-cipher="() => addFolder()"
    />
    <div v-else>
      <div class="font-semibold mb-2 text-gray">
        {{ $t('type.folder') }} ({{ filteredFolder ? filteredFolder.length || 0 : 0}})
      </div>
      <ul class="list-folders">
        <li
          v-for="folder in filteredFolder"
          :key="folder.id"
        >
          <FolderRow
            :folder="folder"
            @edit-folder="() => editFolder(folder)"
          />
        </li>
      </ul>
    </div>
    <AddEditFolder
      key="folders"
      ref="addEditFolder"
      @done="() => $router.push({ name: 'folders' })"
    />
  </div>
</template>

<script>
import Vue from "vue";
import NoCipher from "@/popup/components/ciphers/NoCipher";
import FolderRow from "@/popup/components/folder/FolderRow.vue";
import AddEditFolder from '@/popup/components/folder/AddEditFolder'

export default Vue.extend({
  components: {
    NoCipher,
    FolderRow,
    AddEditFolder
  },
  asyncComputed: {
    folders: {
      async get () {
        let results = []
        const allCiphers = (await this.$searchService.searchCiphers(
          this.searchText,
          [(c) => !c.isDeleted],
          null
        )) || [];
        try {
          results = await this.$folderService.getAllDecrypted() || [];
        } catch (error) {
          results = []
        }
        results = results.filter((f) => f.id).map((f) => ({ ...f, items: allCiphers.filter((c) => c.folderId === f.id)}));
        return results;
      },
      watch: [
        "$store.state.syncedCiphersToggle"
      ]
    },
  },
  computed: {
    filteredFolder() {
      return (this.folders || []).filter((f) => this.searchText ? f.name.toLowerCase().includes(this.searchText.toLowerCase() || '') : true)
    }
  },
  methods: {
    addFolder () {
      this.$refs.addEditFolder?.openDialog({}, true)
    },
    editFolder (folder) {
      this.$refs.addEditFolder?.openDialog(folder, true)
    },
  }
})
</script>

<style lang="scss" scoped>
</style>
