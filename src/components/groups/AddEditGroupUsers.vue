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
        {{ $t('data.groups.user_access') }} {{ group.name }}
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
                <div class="text-black font-semibold truncate">{{ scope.row.full_name || scope.row.email }}</div>
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
          @click="putGroupUsers(group)"
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
      users: [],
      groupUsers: [],
      group: {
        name: '',
        access_all: false,
        collections: []
      },
      dialogVisible: false,
      loading: false,
      multipleSelection: []
    }
  },
  computed: {
  },
  methods: {
    async openDialog (group = {}) {
      this.group = { ...group }
      this.dialogVisible = true
      this.loading = true
      await this.getGroupUsers(group)
      await this.getUsers()
      this.loading = false
      this.$nextTick(() => {
        this.users.forEach(e => {
          if (['owner', 'admin'].includes(e.role)) {
            this.$refs.multipleTable.toggleRowSelection(e)
          } else if (this.groupUsers.some(u => u.id === e.id)) {
            this.$refs.multipleTable.toggleRowSelection(e)
          }
        })
      })
    },
    closeDialog () {
      this.dialogVisible = false
    },
    async getGroupUsers (group) {
      this.groupUsers = await this.axios.get(`cystack_platform/pm/teams/${this.$route.params.teamId}/groups/${group.id}/users`)
    },
    async putGroupUsers (group) {
      try {
        this.loading = true
        await this.axios.put(`cystack_platform/pm/teams/${this.$route.params.teamId}/groups/${group.id}/users`, {
          members: this.multipleSelection.map(e => e.id)
        })

        this.notify(this.$t('data.notifications.update_group_success'), 'success')
        this.closeDialog()
        this.$emit('done')
      } catch (e) {
        this.errors = (e.response && e.response.data && e.response.data.details) || {}
        this.notify(this.$t('data.notifications.update_group_failed'), 'warning')
      } finally {
        this.loading = false
      }
    },
    async getUsers () {
      const users = await this.axios.get(`cystack_platform/pm/teams/${this.$route.params.teamId}/members`)
      this.users = users.filter(e => e.status === 'confirmed')
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
    }
  }
})
</script>
