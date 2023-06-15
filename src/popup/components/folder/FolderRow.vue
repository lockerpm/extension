<template>
  <div
    class="folder-item"
  >
    <div class="menu-icon mr-4">
      <img
        src="@/assets/images/icons/icon_folder.svg"
        alt=""
        style="width: 32px; height: 32px;"
      >
    </div>
    <div class="flex-1">
      <div
        class="text-black font-semibold truncate hover:text-primary cursor-pointer"
        style="line-height: 18px;"
        @click.self="routerFolder(folder)"
      >
        {{ folder.name }}
      </div>
      <div
        class="truncate text-gray"
        style="line-height: 16px;"
      >
        <small>
          {{ folder && folder.items && folder.items.length || 0 }} {{ $tc('type.0', 2) }}
        </small>
      </div>
    </div>
    <div class="folder-item__right">
      <el-dropdown trigger="click">
        <i class="el-icon-more"></i>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            @click.native="() => $emit('edit-folder')"
          >
            {{ $t('common.rename') }}
          </el-dropdown-item>
          <el-dropdown-item
            class="text-danger"
            @click.native="() => deleteFolder(folder.id)"
          >
            {{ $t('common.delete') }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  components: {},
  props: {
    folder: {
      type: Object
    }
  },
  methods: {
    routerFolder (folder) {
      this.$router.push({
        name: "folder-detail",
        params: { id: folder.id, data: folder },
      });
    },
  }
})
</script>

<style lang="scss" scoped>
.folder-item {
  &__right {
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .el-icon-more {
      font-size: 20px;
    }
  }
}
</style>
