<template>
  <div
    id="show-header"
    class="fixed top-0 w-full"
  >
    <div class="flex items-center justify-between h-full w-full p-4">
      <div
        class="s-header-left cursor-pointer"
        @click="() => showMenuData.back()"
      >
        <i class="el-icon-back text-head-5 font-semibold"></i>
      </div>
      <div class="s-header-center flex items-center">
        <Vnodes
          v-if="showMenuData.Icon"
          :vnodes="showMenuData.Icon"
        />
        <div class="px-2 text-head-6 font-semibold">
          {{ showMenuData.title }}
        </div>
      </div>
      <div class="s-header-right flex items-center">
        <el-dropdown
          v-if="showMenuData && showMenuData.menus && showMenuData.menus.length > 0"
          trigger="click"
          class="ml-2"
        >
          <i
            class="el-icon-more"
            style="transform: rotate(90deg)"
          />
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="(menu, index) in showMenuData.menus"
              :key="index"
              :class="menu.class || ''"
              @click.native="() => menu.click()"
            >
              {{ menu.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button
          v-else-if="showMenuData.isCreate"
          icon="el-icon-plus"
          circle
          type="primary"
          size="mini"
          @click="() => openDialog()"
        />
      </div>
    </div>
    <AddExcludeDomain
      ref="addExcludeDomain"
    />
  </div>
</template>

<script>
import Vnodes from "@/popup/components/Vnodes.vue";
import AddExcludeDomain from '@/popup/components/setting/AddExcludeDomain.vue'

export default {
  name: 'ShowHeader',
  components: { Vnodes, AddExcludeDomain },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data() {
    return {
    }
  },
  computed: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    showMenuData() {
      const width = 28;
      const result = {
        Icon: null,
        title: '',
        menus: [],
        isCreate: false,
        back: () => this.$router.back()
      }
      switch (this.$route.name) {
      case 'vault-detail':
        result.title = this.$route.params?.data?.name
        result.back = () => this.$router.push({
          name: 'vault',
          query: { type: this.$route.params?.data?.type }
        }).catch(() => ({}))
        result.menus = [
          {
            label: this.$t('common.edit'),
            click: () => {
              this.$router.push({
                name: 'add-edit-cipher',
                params: this.$route.params
              }).catch(() => ({}))
            }
          },
          {
            label: this.$t('common.delete'),
            class: 'text-danger',
            click: () => this.deleteCiphers([this.$route.params?.id], result.back)
          }
        ]
        result.Icon = this.getIconCipher(this.$route.params?.data, width);
        break;
      case 'folder-detail':
        result.title = this.$route.params?.data?.name
        result.back = () => this.$router.push({ name: 'folders' }).catch(() => ({}))
        result.menus = [
          {
            label: this.$t('common.delete'),
            click: () => this.deleteFolder(this.$route.params?.data?.id, result.back)
          }
        ]
        result.Icon = this.$createElement("img", {
          attrs: {
            src: require("@/assets/images/icons/folder.svg"),
            width: `${width}px`,
            height: `${width}px`,
          }
        })
        break;
      case 'add-edit-cipher':
        if (this.$route.params?.folder) {
          result.back = () => this.$router.push({
            name: 'folder-detail',
            params: { data: this.$route.params?.folder },
            query: { type: this.$route.params?.data?.type }
          }).catch(() => ({}))
        } else {
          result.back = () => this.$router.push({
            name: 'vault',
            query: { type: this.$route.params?.data?.type || this.$route.params?.type }
          }).catch(() => ({}))
        }
        if (this.$route.params?.data) {
          result.title = this.$t('common.edit') + ' ' + this.$tc(`type.${this.$route.params?.data?.type}`, 1)
          result.menus = [
            {
              label: this.$t('common.detail'),
              click: () => {
                this.$router.push({
                  name: 'vault-detail',
                  params: { id: this.$route.params?.data?.id, data: this.$route.params?.data }
                }).catch(() => ({}))
              }
            },
            {
              label: this.$t('common.delete'),
              class: 'text-danger',
              click: () => this.deleteCiphers([this.$route.params?.data?.id], result.back)
            }
          ]
          result.Icon = this.getIconCipher(this.$route.params?.data, width);
        } else {
          result.title = this.$t('data.ciphers.add_cipher')
          result.Icon = null
        }
        break;
      case 'settings-excluded-domains':
        result.Icon = null
        result.back = () => this.$router.push({ name: 'settings' }).catch(() => ({}))
        result.title = this.$t('data.settings.excluded_domains')
        result.isCreate = true
        break;
      case 'settings-vault-timeout':
        result.Icon = null
        result.back = () => this.$router.push({ name: 'settings' }).catch(() => ({}))
        result.title = this.$t('data.settings.vault_timeout')
        break;
      case 'settings-info':
        result.Icon = null
        result.back = () => this.$router.push({ name: 'settings' }).catch(() => ({}))
        result.title = this.$t('data.settings.about')
        break;
      default:
        break;
      }
      return result
    }
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    openDialog () {
      this.$refs.addExcludeDomain?.openDialog({}, true)
    },
  },
}
</script>

<style lang="scss">
#show-header {
  z-index: 2000;
  height: 60px;
  background-color: white;
}
</style>


