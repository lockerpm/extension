<template>
  <div
    class="p-4 text-[#A2A3A7] vault-body"
  >
    <div v-if="folders" class="mt-5 font-semibold mb-4">
      {{ $t('type.folder') }} ({{folders.length}})
    </div>
    <ul class="list-folders">
      <li
        v-for="item in folders"
        :key="item.id"
        class="folder-item"
        @click="routerFolder(item)"
      >
        <div class="menu-icon mr-4">
          <!-- <i class="fas fa-folder text-[20px]"></i> -->
          <img
            src="@/assets/images/icons/icon_folder.svg"
            alt=""
            style="border-radius: 50%"
          >
        </div>
        <div class="flex-grow flex justify-between mr-2">
          <div class="w-[200px] truncate text-black font-semibold">
            {{ item.name }}
          </div>
          <!-- <div>
            {{ item.ciphersCount }} {{$tc('type.Vault', item.ciphersCount)}}
          </div> -->
        </div>
        <div>
          <i class="fas fa-chevron-right"></i>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import Vue from "vue";
export default Vue.extend({
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
        return results;
      },
      watch: []
    },
  },
  methods: {
    routerFolder (item) {
      this.$router.push({
        name: "folder-detail",
        params: { id: item.id },
      });
    },
  }
})
</script>

<style lang="scss" scoped>
</style>
