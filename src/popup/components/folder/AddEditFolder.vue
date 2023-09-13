<template>
  <el-dialog
    :visible.sync="visible"
    :title="folder.id ? $t('data.folders.edit_folder') : $t('data.folders.add_folder')"
    width="85%"
    destroy-on-close
    append-to-body
    custom-class="locker-dialog"
  >
    <div class="text-left">
      <ValidationProvider
        v-slot="{ errors: err }"
        rules="required"
        :name="$t('common.folder_name')"
      >
        <InputText
          v-model="folder.name"
          class="w-full"
          required
          :disabled="callingAPI"
          :bottom-border="true"
          :label="$t('common.folder_name')"
          :error-text="err && err.length && err[0]"
        />
      </ValidationProvider>
    </div>
    <div slot="footer" class="dialog-footer flex items-center justify-end">
      <div>
        <el-button
          size="small"
          :disabled="callingAPI"
          @click="visible = false"
        >
          {{ $t('common.cancel') }}
        </el-button>
        <el-button
          size="small"
          type="primary"
          :loading="callingAPI"
          :disabled="!folder.name"
          @click="handleSave"
        >
          {{ folder.id ? $t('common.update') : $t('common.add') }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import InputText from '@/components/input/InputText'
import { ValidationProvider } from 'vee-validate'
import { FolderRequest } from "jslib-common/models/request/folderRequest";

import cystackPlatformAPI from '@/api/cystack_platform';


export default Vue.extend({
  components: {
    InputText,
    ValidationProvider
  },
  data () {
    return {
      item: {},
      folder: {},
      callingAPI: false,
      visible: false,
      errors: {},
      redirect: false,
      shouldRedirect: false
    }
  },
  methods: {
    openDialog (folder = {}, shouldRedirect = false) {
      this.visible = true
      this.shouldRedirect = shouldRedirect
      this.item = folder || {}
      this.folder = { ...folder }
    },
    async handleSave() {
      if (this.folder && this.folder.id) {
        await this.putFolder()
      } else {
        await this.postFolder()
      }
    },
    async postFolder() {
      try {
        this.callingAPI = true
        const folderEnc = await this.$folderService.encrypt(this.folder)
        const data = new FolderRequest(folderEnc)
        const res = await cystackPlatformAPI.create_folder(data)

        this.$emit('done')
        this.$emit('created-folder', { id: res.id, name: this.folder.name })
        this.notify(this.$tc('data.notifications.create_success', 1, { type: this.$t('common.folder') }), 'success')
        this.visible = false
      } catch (e) {
        this.errors = (e.response && e.response.data && e.response.data.details) || {}
        this.notify(this.$tc('data.notifications.create_failed', 1, { type: this.$t('common.folder') }), 'warning')
      } finally {
        this.callingAPI = false
      }
    },
    async putFolder() {
      if (this.folder.name == this.item.name) {
        this.notify(this.$tc('data.notifications.update_success', 1, { type: this.$t('common.folder') }), 'success')
        this.visible = false
        return
      }
      try {
        this.callingAPI = true
        const folderEnc = await this.$folderService.encrypt(this.folder)
        const data = new FolderRequest(folderEnc)
        await cystackPlatformAPI.update_folder(this.folder.id, data)
        this.$emit('done')
        this.notify(this.$tc('data.notifications.update_success', 1, { type: this.$t('common.folder') }), 'success')
        this.visible = false
      } catch (e) {
        this.errors = (e.response && e.response.data && e.response.data.details) || {}
        this.notify(this.$tc('data.notifications.update_failed', 1, { type: this.$t('common.folder') }), 'warning')
      } finally {
        this.callingAPI = false
      }
    }
  }
}
)
</script>
