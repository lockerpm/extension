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
        {{ folder.id ? $t('data.folders.edit_team_folder') : $t('data.folders.add_team_folder') }}
      </div>
    </div>
    <div class="text-left">
      <InputSelectTeam
        v-if="!folder.id && dialogVisible"
        :label="$t('common.ownership')"
        :options="teams"
        class="w-full"
        :initial-value="folder.organizationId"
        :disabled="$route.params.teamId"
        @change="(v) => folder.organizationId = v"
      />
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
          :disabled="loading || !folder.organizationId || !folder.name"
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
import InputSelectTeam from '@/components/input/InputSelectTeam'
import InputText from '@/components/input/InputText'
export default Vue.extend({
  components: {
    InputSelectTeam,
    InputText,
    ValidationProvider
  },
  data () {
    return {
      folder: {
        organizationId: '',
        name: ''
      },
      loading: false,
      dialogVisible: false,
      errors: {},
      redirect: false,
      shouldRedirect: false,
      team: {}
    }
  },
  computed: {
  },
  methods: {
    openDialog (folder = {}, shouldRedirect = false) {
      this.dialogVisible = true
      this.shouldRedirect = shouldRedirect
      this.folder = { organizationId: '', name: '', ...folder }
    },
    closeDialog () {
      this.dialogVisible = false
    },
    async postFolder (folder) {
      try {
        this.loading = true
        const orgKey = await this.$cryptoService.getOrgKey(folder.organizationId)
        const name = (await this.$cryptoService.encrypt(folder.name, orgKey)).encryptedString
        const res = await this.axios.post(`cystack_platform/pm/teams/${folder.organizationId}/folders`, { name })
        this.$emit('done')
        this.closeDialog()
        if (this.shouldRedirect) {
          await this.$router.push({ name: 'vault-tfolders-folderId', params: { tfolderId: res.id } })
        }
      } catch (e) {
        this.errors = (e.response && e.response.data && e.response.data.details) || {}
      } finally {
        this.loading = false
      }
    },
    async putFolder (folder) {
      try {
        this.loading = true
        const orgKey = await this.$cryptoService.getOrgKey(folder.organizationId)
        const name = (await this.$cryptoService.encrypt(folder.name, orgKey)).encryptedString
        await this.axios.put(`cystack_platform/pm/teams/${folder.organizationId}/folders/${folder.id}`, { name })
        this.$emit('done')
        this.closeDialog()
      } catch (e) {
        this.errors = (e.response && e.response.data && e.response.data.details) || {}
      } finally {
        this.loading = false
      }
    },
    async deleteFolder (folder) {
      this.$confirm(this.$t('data.notifications.deleted_team_folder'), this.$t('common.warning'), {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(async () => {
        try {
          this.loading = true
          await this.axios.post(`cystack_platform/pm/teams/${folder.organizationId}/folders/${folder.id}/delete`)
          this.$emit('done')
          this.closeDialog()
          this.notify(this.$tc('data.notifications.delete_success', 1, { type: this.$t('common.folder') }), 'success')
        } catch (e) {
          this.errors = (e.response && e.response.data && e.response.data.details) || {}
          this.notify(this.$tc('data.notifications.delete_failed', 1, { type: this.$t('common.folder') }), 'warning')
        } finally {
          this.loading = false
        }
      })
    },
    canManage (team) {
      return ['owner', 'admin'].includes(team.role) && !team.locked
    }
  }
}
)
</script>
