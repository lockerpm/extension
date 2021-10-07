<template>
  <el-dialog
    :visible.sync="dialogVisible"
    width="575px"
    destroy-on-close
    top="5vh"
    custom-class="locker-dialog"
    :close-on-click-modal="false"
  >
    <div slot="title">
      <div class="text-head-5 text-black-700 font-semibold truncate">
        {{ $t('data.folders.groups_access') }} {{ name }}
      </div>
    </div>
    <div class="text-left-">
      <el-table
        ref="multipleTable"
        v-loading="loading"
        :data="groups"
        style="width: 100%"
        max-height="350"
        @selection-change="handleSelectionChange"
      >
        >
        <el-table-column
          type="selection"
          width="55"
          :selectable="(row, index) => !row.access_all"
        />
        <el-table-column>
          <template slot-scope="scope">
            <div class="flex items-center">
              <img src="@/assets/images/icons/group.svg" alt="" class="select-none">
              <div class="ml-2">
                <div class="text-black truncate">{{ scope.row.name }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
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
          @click="putTeamFolderGroups(folder)"
        >
          {{ $t('common.update') }}
        </button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
export default Vue.extend({
  data () {
    return {
      folder: {},
      loading: false,
      dialogVisible: false,
      errors: {},
      groups: [],
      teamFolderGroups: [],
      multipleSelection: [],
      name: ''
    }
  },
  computed: {
  },
  methods: {
    async openDialog (folder = {}) {
      this.dialogVisible = true
      this.folder = { ...folder }
      this.name = folder.name
      this.loading = true
      await this.getGroups(folder)
      await this.getTeamFolderGroups(folder)
      this.loading = false
      this.$nextTick(() => {
        this.groups.forEach(e => {
          if (e.access_all) {
            this.$refs.multipleTable.toggleRowSelection(e)
          }
          if (!e.access_all && this.folder.group_ids.includes(e.id)) {
            this.$refs.multipleTable.toggleRowSelection(e)
          }
        })
      })
    },
    closeDialog () {
      this.dialogVisible = false
    },
    async putTeamFolderGroups (folder) {
      try {
        this.loading = true
        await this.axios.put(`cystack_platform/pm/teams/${folder.organization_id}/folders/${folder.id}`, {
          ...folder,
          group_ids: this.multipleSelection.map(e => e.id)
        })
        this.closeDialog()
        this.$emit('done')
        this.notify(this.$t('data.notifications.update_folder_success'), 'success')
      } catch (e) {
        this.errors = (e.response && e.response.data && e.response.data.details) || {}
        this.notify(this.$t('data.notifications.update_folder_failed'), 'warning')
      } finally {
        this.loading = false
      }
    },
    async getGroups (folder) {
      this.groups = await this.axios.get(`cystack_platform/pm/teams/${folder.organizationId}/groups`)
    },
    async getTeamFolderGroups (folder) {
      this.folder = await this.axios.get(`cystack_platform/pm/teams/${folder.organizationId}/folders/${folder.id}`)
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
    }
  }
})
</script>
