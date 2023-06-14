<template>
  <div
    class="vault-body px-4 pb-4"
    v-loading="$store.state.syncing"
  >
    <NoCipher
      v-if="!folders.length && !$store.state.syncing"
      :type="0"
      @add-cipher="() => $router.push({ name: 'add-edit-folder' })"
    />
    <div v-else>
      <div class="font-semibold mb-2 text-[#A2A3A7]">
        {{ $t('type.folder') }} ({{filteredFolder.length}})
      </div>
      <ul class="list-folders">
        <li
          v-for="item in filteredFolder"
          :key="item.id"
          class="folder-item"
          @click="routerFolder(item)"
        >
          <div class="menu-icon mr-4">
            <img
              src="@/assets/images/icons/icon_folder.svg"
              alt=""
              style="width: 32px; height: 32px;"
            >
          </div>
          <div class="flex-grow flex justify-between mr-2">
            <div class="w-[200px] truncate text-black font-semibold">
              {{ item.name }}
            </div>
          </div>
          <div>
            <i class="fas fa-chevron-right"></i>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import NoCipher from "@/popup/components/ciphers/NoCipher";

export default Vue.extend({
  components: {
    NoCipher
  },
  asyncComputed: {
    folders: {
      async get () {
        let results = []
        try {
          results = await this.$folderService.getAllDecrypted() || [];
        } catch (error) {
          results = []
        }
        results = results.filter((f) => f.id);
        return results || [];
      },
      watch: []
    },
  },
  computed: {
    filteredFolder() {
      return this.folders.filter((f) => f.name.toLowerCase().includes(this.searchText?.toLowerCase() || ''))
    }
  },
  methods: {
    routerFolder (item) {
      this.$router.push({
        name: "folder-detail",
        params: { id: item.id, data: item },
      });
    },
  }
})
</script>

<style lang="scss" scoped>
</style>
