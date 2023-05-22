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
        {{ $t('data.folders.groups_access') }} {{ user.name }}
      </div>
    </div>
    <div class="text-left">
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
        />
        <el-table-column>
          <template slot-scope="scope">
            <div class="text-black font-semibold truncate">{{ scope.row.name }}</div>
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
  components: {
  },
  data () {
    return {
      groups: [],
      userGroups: [],
      user: {
      },
      dialogVisible: false,
      loading: false,
      multipleSelection: []
    }
  },
  computed: {
  },
  methods: {
    async openDialog (user = {}) {
      this.user = { ...user }
      this.dialogVisible = true
      this.loading = true
      await this.getUserGroups(user)
      await this.getGroups()
      this.loading = false
      this.$nextTick(() => {
        this.groups.forEach(e => {
          if (this.userGroups.includes(e.id)) {
            this.$refs.multipleTable.toggleRowSelection(e)
          }
        })
      })
    },
    closeDialog () {
      this.dialogVisible = false
    },
    async getUserGroups (user) {
      this.userGroups = await this.axios.get(`cystack_platform/pm/teams/${this.$route.params.teamId}/members/${user.id}/groups`)
    },
    async putGroupUsers (user) {
      try {
        this.loading = true
        await this.axios.put(`cystack_platform/pm/teams/${this.$route.params.teamId}/members/${user.id}/groups`, {
          group_ids: this.multipleSelection.map(e => e.id)
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
    async getGroups () {
      this.groups = await this.axios.get(`cystack_platform/pm/teams/${this.$route.params.teamId}/groups`)
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
    }
  }
})
</script>
