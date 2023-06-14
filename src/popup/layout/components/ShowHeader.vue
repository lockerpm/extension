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
        <div class="px-2 text-head-6">
          {{ showMenuData.title }}
        </div>
      </div>
      <div class="s-header-right flex items-center">
        <el-button
          v-if="showMenuData.isSave"
          icon="el-icon-check"
          type="primary"
          size="small"
          round
          @click="$emit('save')"
        >
          {{ $t('common.save') }}
        </el-button>
        <el-dropdown
          v-if="showMenuData.menus.length > 0"
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
              @click.native="() => menu.click()"
            >
              {{ menu.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
import Vnodes from "@/popup/components/Vnodes.vue";
import cystackPlatformAPI from '@/api/cystack_platform';

export default {
  name: 'ShowHeader',
  components: { Vnodes },
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
        isSave: false,
        menus: [],
        back: () => this.$router.back()
      }
      switch (this.$route.name) {
      case 'vault-detail':
        result.title = this.$route.params?.data?.name
        result.back = () => this.$router.push({ name: 'vault' })
        result.menus = [
          {
            label: this.$t('common.edit'),
            click: () => {
              this.$router.push({ name: 'add-edit-cipher', params: this.$route.params })
            }
          },
          {
            label: this.$t('common.delete'),
            click: () => this.deleteCiphers([this.$route.params?.id])
          }
        ]
        result.Icon = this.getIconCipher(this.$route.params?.data, width);
        break;
      case 'folder-detail':
        result.title = this.$route.params?.data?.name
        result.back = () => this.$router.push({ name: 'folders' })
        result.menus = [
          {
            label: this.$t('common.edit'),
            click: () => {
              this.$router.push({ name: 'add-edit-folder', params: this.$route.params?.data })
            }
          },
          {
            label: this.$t('common.delete'),
            click: () => {
              //
            }
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
        result.isSave = true
        result.back = () => this.$router.push({ name: 'vault' })
        if (this.$route.params?.data) {
          result.title = this.$t('common.edit') + ' ' + this.$tc(`type.${this.$route.params?.data?.type}`, 1)
          result.menus = [
            {
              label: this.$t('common.detail'),
              click: () => {
                this.$router.push({ name: 'vault-detail', params: { id: this.$route.params?.data?.id, data: this.$route.params?.data } })
              }
            },
            {
              label: this.$t('common.delete'),
              click: () => {
                //
              }
            }
          ]
          result.Icon = this.getIconCipher(this.$route.params?.data, width);
        } else {
          result.title = this.$t('data.ciphers.add_cipher')
          result.Icon = null
        }
        break;
      case 'add-edit-folder':
        result.isSave = true
        result.back = () => this.$router.push({ name: 'folders' })
        result.Icon = this.$createElement("img", {
          attrs: {
            src: require("@/assets/images/icons/folder.svg"),
            width: `${width}px`,
            height: `${width}px`,
          }
        })
        if (this.$route.params.data) {
          result.title = this.$t('common.edit') + ' ' + this.$t('common.folder')
          result.menus = [
            {
              label: this.$t('common.detail'),
              click: () => {
                this.$router.push({ name: 'folder-detail', params: { id: this.$route.params?.data?.id, data: this.$route.params?.data } })
              }
            },
            {
              label: this.$t('common.delete'),
              click: () => {
                //
              }
            }
          ]
        } else {
          result.title = this.$t('common.add') + ' ' + this.$t('common.folder')
          result.menus = []
        }
        break;
      case 'add-edit-otp':
        result.isSave = true
        result.back = () => this.$router.push({ name: 'otp' })
        result.Icon = this.$createElement("img", {
          attrs: {
            src: require("@/assets/images/icons/icon_OTP.svg"),
            width: `${width}px`,
            height: `${width}px`,
          }
        })
        if (this.$router.params?.data) {
          result.title = this.$t('common.edit') + ' ' + this.$t('data.parts.otp')
          result.menus = [
            {
              label: this.$t('common.delete'),
              click: () => this.deleteCiphers([this.$router.params?.data?.id])
            }
          ]
        } else {
          result.title = this.$t('common.add') + ' ' + this.$t('data.parts.otp')
          result.menus = []
        }
        break;
      case 'settings-excluded-domains':
        result.Icon = null
        result.back = () => this.$router.push({ name: 'settings' })
        result.title = this.$t('data.settings.excluded_domains')
        break;
      case 'settings-vault-timeout':
        result.Icon = null
        result.back = () => this.$router.push({ name: 'settings' })
        result.title = this.$t('data.settings.vault_timeout')
        break;
      case 'settings-info':
        result.Icon = null
        result.back = () => this.$router.push({ name: 'settings' })
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
    async deleteCiphers (ids) {
      this.$confirm(this.$tc('data.notifications.delete_selected_desc', ids.length), this.$t('common.warning'), {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(async () => {
        try {
          await cystackPlatformAPI.ciphers_permanent_delete({ ids })
          this.notify(this.$tc('data.notifications.delete_success', ids.length, { type: this.$tc('type.0', ids.length) }), 'success')
          this.$router.back()
        } catch (e) {
          this.notify(this.$tc('data.notifications.delete_failed', ids.length, { type: this.$tc('type.0', ids.length) }), 'warning')
        }
      })
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


