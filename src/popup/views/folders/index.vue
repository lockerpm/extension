<template>
  <div
    style="padding-top: 180px; padding-bottom: 56px;"
    class="p-4 text-[#A2A3A7]"
  >
    <div class="mt-5 font-semibold mb-4">
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
export default {
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
        // folders.forEach((f) => {
        //   const ciphers =
        //     this.ciphers &&
        //     (this.ciphers.filter((c) => c.folderId === f.id) || []);
        //   f.ciphersCount = ciphers && ciphers.length;
        // });
        return folders;
      },
      watch: ["ciphers"],
    },
  },
  methods: {
    routerFolder (item) {
      this.$router.push({
        name: "folders-folderId",
        params: { folderId: item.id },
      });
    },
  }
}
</script>

<style lang="scss" scoped>
</style>
