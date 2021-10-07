<template>
  <el-dialog
    :visible.sync="dialogVisible"
    width="435px"
    destroy-on-close
    top="5vh"
    custom-class="locker-dialog"
    :close-on-click-modal="false"
  >
    <div slot="title">
      <div class="text-head-5 text-black-700 font-semibold truncate">
        {{ folder.id ? $t('data.folders.edit_folder') : $t('data.folders.add_folder') }}
      </div>
    </div>
    <div class="text-left">
      <ValidationProvider
        v-slot="{ errors: err }"
        rules="required"
        :name="$t('common.folder_name')"
      >
        <InputText
          v-model="folder.name"
          :label="$t('common.folder_name')"
          class="w-full "
          :error-text="err && err.length && err[0]"
        />
      </ValidationProvider>
    </div>
    <div slot="footer" class="dialog-footer flex items-center text-left">
      <div class="flex-grow">
        <button
          v-if="folder.id"
          class="btn btn-icon !text-danger"
          @click="deleteFolder(folder)"
        >
          <i class="fa fa-trash-alt" />
        </button>
      </div>
      <div>
        <button
          class="btn btn-default"
          @click="dialogVisible = false"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          class="btn btn-primary"
          :disabled="loading || !folder.name"
          @click="folder.id ?putFolder(folder):postFolder(folder)"
        >
          {{ folder.id ? $t('common.update') : $t('common.add') }}
        </button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import { ValidationProvider } from 'vee-validate'
import { FolderRequest } from "jslib-common/models/request/folderRequest";
import InputText from '@/components/input/InputText'
export default Vue.extend({
  components: {
    InputText,
    ValidationProvider
  },
  data () {
    return {
      folder: {},
      loading: false,
      dialogVisible: false,
      errors: {},
      redirect: false,
      shouldRedirect: false,
      writeableCollections: []
    }
  },
  computed: {
    ownershipOptions () {
      const teams = this.teams.filter(e => ['owner', 'admin'].includes(e.role))
      return [{ name: this.currentUser.email, organization_id: null }, ...teams]
    }
  },
  mounted () {
    this.getWritableCollections()
  },
  methods: {
    openDialog (folder = {}, shouldRedirect = false) {
      this.dialogVisible = true
      this.shouldRedirect = shouldRedirect
      this.folder = { ...folder }
    },
    closeDialog () {
      this.dialogVisible = false
    },
    async postFolder (folder) {
      try {
        this.loading = true
        const folderEnc = await this.$folderService.encrypt(folder)
        const data = new FolderRequest(folderEnc)
        const res = await this.axios.post('cystack_platform/pm/folders', data)
        this.$emit('done')
        this.$emit('created-folder', { id: res.id, name: folder.name })
        this.closeDialog()
        if (this.shouldRedirect) {
          this.$router.push({ name: 'vault-folders-folderId', params: { folderId: res.id } })
        }
      } catch (e) {
        this.errors = (e.response && e.response.data && e.response.data.details) || {}
      } finally {
        this.loading = false
      }
    },
    async deleteFolder (folder) {
      this.$confirm(this.$t('data.notifications.deleted_folder'), this.$t('common.warning'), {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(async () => {
        try {
          this.loading = true
          await this.axios.delete(`cystack_platform/pm/folders/${folder.id}`)
          this.$emit('done')
          this.closeDialog()
          this.notify(this.$tc('data.notifications.delete_success', 1, { type: this.$t('common.folder') }), 'success')
        } catch (e) {
          this.errors = (e.response && e.response.data && e.response.data.details) || {}
          this.notify(this.$tc('data.notifications.delete_failed', 1, { type: this.$t('common.folder') }), 'success')
        } finally {
          this.loading = false
        }
      })
    },
    async putFolder (folder) {
      try {
        this.loading = true
        const folderEnc = await this.$folderService.encrypt(folder)
        const data = new FolderRequest(folderEnc)
        await this.axios.put(`cystack_platform/pm/folders/${folder.id}`, data)
        this.$emit('done')
        this.closeDialog()
      } catch (e) {
        this.errors = (e.response && e.response.data && e.response.data.details) || {}
      } finally {
        this.loading = false
      }
    },
    async getWritableCollections () {
      const allCollections = await this.$collectionService.getAllDecrypted()
      this.writeableCollections = allCollections.filter(c => !c.readOnly)
    }
  }
}
)
</script>
