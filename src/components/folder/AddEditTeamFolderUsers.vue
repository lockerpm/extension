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
        {{ $t('data.folders.user_access') }} {{ folder.name }}
      </div>
    </div>
    <div class="text-left">
      <el-table
        ref="multipleTable"
        v-loading="loading"
        :data="users"
        style="width: 100%"
        max-height="350"
        @selection-change="handleSelectionChange"
      >
        >
        <el-table-column
          type="selection"
          width="55"
          :selectable="(row, index) => ['member', 'manager'].includes(row.role)"
        />
        <el-table-column
          prop="date"
        >
          <template slot-scope="scope">
            <div class="flex items-center">
              <el-avatar :src="scope.row.avatar" :size="32" />
              <div class="ml-2">
                <div class="text-black font-semibold truncate">
                  {{ scope.row.full_name || scope.row.email }}
                </div>
                <div v-if="scope.row.username">@{{ scope.row.username }}</div>
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
          @click="putTeamFolderUsers(folder)"
        >
          {{ $t('common.update') }}
        </button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import cystackPlatformAPI from '@/api/cystack_platform'

export default Vue.extend({
  data () {
    return {
      folder: {},
      loading: false,
      dialogVisible: false,
      errors: {},
      users: [],
      teamFolderUsers: [],
      multipleSelection: []
    }
  },
  computed: {
  },
  methods: {
    async openDialog (folder = {}) {
      this.dialogVisible = true
      this.folder = { ...folder }
      this.loading = true
      await this.getUsers(folder)
      await this.getTeamFolderUsers(folder)
      this.loading = false
      this.$nextTick(() => {
        this.users.forEach(e => {
          if (['owner', 'admin'].includes(e.role)) {
            this.$refs.multipleTable.toggleRowSelection(e)
          } else if (this.teamFolderUsers.some(u => u.id === e.id)) {
            this.$refs.multipleTable.toggleRowSelection(e)
          }
        })
      })
    },
    closeDialog () {
      this.dialogVisible = false
    },
    async putTeamFolderUsers (folder) {
      try {
        this.loading = true
        await cystackPlatformAPI.update_team_folder_users(folder.organizationId, folder.id, {
          members: this.multipleSelection.map(e => e.id)
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
    async getUsers (folder) {
      const users = await cystackPlatformAPI.team_members(folder.organizationId);
      this.users = users.filter(e => e.status === 'confirmed')
    },
    async getTeamFolderUsers (folder) {
      this.teamFolderUsers = await cystackPlatformAPI.team_folder_users(folder.organizationId, folder.id)
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
    }
  }
}
)
</script>
