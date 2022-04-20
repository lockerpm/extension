<template>
  <div>
    <el-dialog
      :visible.sync="dialogVisible"
      width="435px"
      destroy-on-close
      top="10vh"
      custom-class="locker-dialog"
      :close-on-click-modal="false"
    >
      <div slot="title">
        <div class="text-head-5 text-black-700 font-semibold truncate">
          {{ $t('data.folders.move_to') }}
        </div>
      </div>
      <div>
        <div class="form-group">
          <label>
            {{ $t('data.notifications.move_selected_desc', {count: ids.length}) }}
          </label>
          <InputSelectFolder
            ref="InputSelectFolder"
            v-if="dialogVisible"
            :initial-value="folderId"
            :options="folders"
            :label="$t('data.folders.select_folder')"
            class="w-full !mb-0 mt-4"
            @change="(v) => folderId = v"
            @addFolder="addFolder"
          />
        </div>
      </div>
      <div slot="footer" class="dialog-footer flex items-center text-left">
        <div class="flex-grow" />
        <div>
          <button
            class="btn btn-default"
            @click="dialogVisible = false"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            class="btn btn-primary"
            :disabled="loading"
            @click="putCiphersFolder(cipher)"
          >
            {{ $t('common.update') }}
          </button>
        </div>
      </div>
    </el-dialog>
    <AddEditFolder ref="addEditFolder" @created-folder="handleCreatedFolder" />
  </div>
</template>

<script>
import Vue from 'vue'
import InputSelectFolder from '@/components/input/InputSelectFolder'
import AddEditFolder from './AddEditFolder'
export default Vue.extend({
  components: {
    InputSelectFolder,
    AddEditFolder
  },
  props: {
    type: {
      type: String,
      default: 'Login'
    }
  },
  data () {
    return {
      cipher: {},
      folders: [],
      dialogVisible: false,
      loading: false,
      errors: {},
      ids: [],
      folderId: ''
    }
  },
  methods: {
    async openDialog (data) {
      this.folders = await this.getFolders()
      this.dialogVisible = true
      this.ids = data
    },
    closeDialog () {
      this.dialogVisible = false
    },
    async putCiphersFolder () {
      try {
        this.loading = true
        await this.axios.put('cystack_platform/pm/ciphers/move', {
          ids: this.ids,
          folderId: this.folderId
        })
        this.notify(this.$tc('data.notifications.move_success', this.ids.length), 'success')
        this.closeDialog()
        this.$emit('reset-selection')
      } catch (e) {
        this.notify(this.$tc('data.notifications.move_failed', this.ids.length), 'warning')
        console.log(e)
      } finally {
        this.loading = false
      }
    },
    addFolder () {
      this.$refs.addEditFolder.openDialog({})
    },
    async handleCreatedFolder (folder) {
      // this.folders = await this.getFolders()
      setTimeout(async () => {
        this.folders = await this.getFolders()
      }, 300);
      this.cipher.folderId = folder.id
      this.$refs.InputSelectFolder.value = this.folderId
    }
  }
})
</script>
