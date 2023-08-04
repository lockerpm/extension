<template>
  <div
    v-loading="$store.state.syncing"
  >
    <NoCipher
      v-if="folders && !folders.length && !$store.state.syncing"
      :type="0"
      @add-cipher="() => addFolder()"
    />
    <div v-else>
      <SortMenu
        :ciphers="filteredFolders || []"
        :label="$t('type.folder')"
        :order-field="orderField"
        :order-direction="orderDirection"
        @sort="changeSort"
      />
      <ul class="list-folders">
        <li
          v-for="folder in pagingFolders"
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
      @done="() => {}"
    />
  </div>
</template>

<script>
import Vue from "vue";
import orderBy from "lodash/orderBy";
import NoCipher from "@/popup/components/ciphers/NoCipher";
import FolderRow from "@/popup/components/folder/FolderRow.vue";
import AddEditFolder from '@/popup/components/folder/AddEditFolder'
import SortMenu from "@/components/SortMenu.vue";

export default Vue.extend({
  components: {
    NoCipher,
    FolderRow,
    AddEditFolder,
    SortMenu
  },
  data() {
    return {
      orderField: "revisionDate",
      orderDirection: 'desc',
      pageSize: 10,
      size: 10
    }
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
        results = orderBy(results, [c => this.orderField === 'name' ? (c.name && c.name.toLowerCase()) : c.revisionDate], [this.orderDirection]) || []
        return results;
      },
      watch: [
        "$store.state.syncedCiphersToggle",
        "orderField",
        "orderDirection"
      ]
    },
  },
  computed: {
    filteredFolders() {
      return (this.folders || []).filter((f) => this.searchText ? f.name.toLowerCase().includes(this.searchText.toLowerCase() || '') : true)
    },
    pagingFolders() {
      if (this.filteredFolders) {
        return this.filteredFolders.slice(0, this.size)
      }
      return []
    },
  },
  mounted () {
    const mainBody = document.querySelector('.main-body')
    if (mainBody) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this
      mainBody.addEventListener('scroll', (e) => {
        if (e.target.clientHeight + e.target.scrollTop === e.target.scrollHeight) {
          if (self.filteredFolders && self.filteredFolders.length > self.pageSize) {
            self.size = self.pageSize + self.size
          }
        }
      })
    }
  },
  methods: {
    addFolder () {
      this.$refs.addEditFolder?.openDialog({}, true)
    },
    editFolder (folder) {
      this.$refs.addEditFolder?.openDialog(folder, true)
    },
    changeSort (sortValue) {
      this.orderField = sortValue.orderField;
      this.orderDirection = sortValue.orderDirection;
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
