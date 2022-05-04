<template>
  <div class="flex flex-col flex-column-fluid relative">
    <div class="flex-column-fluid lg:px-28 py-10 px-10 mb-20">
      <el-table
        v-loading="loading"
        :data="users"
        style="width: 100%"
      >
        <el-table-column label="Users">
          <template slot-scope="scope">
            <div class="flex items-center">
              <el-avatar
                :src="scope.row.avatar"
                :size="32"
              />
              <div class="ml-2">
                <div class="text-black font-semibold truncate">{{ scope.row.full_name || scope.row.email }}</div>
                <div v-if="scope.row.username">@{{ scope.row.username }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="Status"
          align="right"
        >
          <template slot-scope="scope">
            <span
              class="label capitalize"
              :class="{'label-primary-light': scope.row.status === 'confirmed',
                         'label-success-light': scope.row.status === 'accepted',
                         'label-warning-light': scope.row.status === 'invited',
                         'label-danger-light': scope.row.status === 'expired'
                }"
            >
              {{ scope.row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="Role"
          align="right"
        >
          <template slot-scope="scope">
            {{ scope.row.role }}
          </template>
        </el-table-column>
        <el-table-column
          label="Joined at"
          align="right"
        >
          <template slot-scope="scope">
            {{ $moment(scope.row.access_time * 1000).fromNow() }}
          </template>
        </el-table-column>
        <el-table-column align="right">
          <template slot-scope="scope">
            <el-dropdown
              v-if="scope.row.role !=='owner' && scope.row.username !== currentUser.username"
              trigger="click"
              :hide-on-click="false"
            >
              <button class="btn btn-icon btn-xs hover:bg-black-400">
                <i class="fas fa-ellipsis-h" />
              </button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-if="scope.row.status === 'accepted'"
                  @click.native="promptConfirmUser(scope.row)"
                >
                  <span class="text-success">{{ $t('common.confirm') }}</span>
                </el-dropdown-item>
                <template v-if="scope.row.status === 'confirmed'">
                  <el-dropdown-item @click.native="putUser(scope.row)">
                    {{ $t('common.edit') }}
                  </el-dropdown-item>
                  <el-dropdown-item @click.native="putUserGroups(scope.row)">
                    {{ $t('common.groups') }}
                  </el-dropdown-item>
                </template>
                <el-dropdown-item @click.native="deleteUser(scope.row)">
                  <span class="text-danger">
                    {{ $t('common.remove') }}
                  </span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <AddEditUser
      ref="addEditUser"
      @done="getUsers"
    />
    <AddEditUserGroups
      ref="addEditUserGroups"
      @done="getUsers"
    />
    <div class="fixed bottom-[50px] right-[55px]">
      <button
        class="btn btn-fab btn-primary rounded-full flex items-center justify-center"
        @click="postUser({})"
      >
        <i class="fas fa-plus text-[24px]" />
      </button>
    </div>
    <el-dialog
      :visible.sync="dialogConfirmVisible"
      width="435px"
      destroy-on-close
      top="15vh"
      custom-class="locker-dialog"
      :close-on-click-modal="false"
    >
      <div slot="title">
        <div class="text-head-5 text-black-700 font-semibold truncate">
          {{ $t('data.notifications.fingerprint_title') }}
        </div>
      </div>
      <div class="text-left">
        <div class="text-head-6 mb-4">{{ $t('data.notifications.fingerprint_description_1') }}</div>
        <div class="text-danger-400 bg-black-200 bg-opacity-50 rounded px-4 py-2 mb-4">
          {{ userFingerPrint }}
        </div>
        <div class="text-sm">{{ $t('data.notifications.fingerprint_description_2') }}</div>
      </div>
      <div
        slot="footer"
        class="dialog-footer flex items-center text-left"
      >
        <div class="flex-grow" />
        <div>
          <button
            class="btn btn-default"
            @click="dialogConfirmVisible = false"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            class="btn btn-primary"
            :disabled="loadingConfirm"
            @click="confirmUser(selectedUser)"
          >
            {{ $t('common.confirm') }}
          </button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import { Utils } from "jslib-common/misc/utils";
import AddEditUser from '@/components/user/AddEditUser'
import AddEditUserGroups from '@/components/user/AddEditUserGroups'

export default Vue.extend({
  components: {
    AddEditUser, AddEditUserGroups
  },
  data () {
    return {
      users: [],
      loading: true,
      loadingConfirm: false,
      dialogConfirmVisible: false,
      dontAskAgain: false,
      publicKey: null,
      userFingerPrint: '',
      selectedUser: {}
    }
  },
  mounted () {
    this.getUsers()
  },
  methods: {
    postUser () {
      this.$refs.addEditUser.openDialog({})
    },
    getUsers () {
      this.loading = true
      this.axios.get(`cystack_platform/pm/teams/${this.$route.params.teamId}/members`)
        .then(res => {
          this.users = res
          this.loading = false
        })
    },
    putUser (user) {
      this.$refs.addEditUser.openDialog(user)
    },
    deleteUser (user) {
      this.$refs.addEditUser.deleteUser(user)
    },
    async generateOrgKey () {
      const pk = Utils.fromB64ToArray(this.publicKey)
      const orgKey = await this.$cryptoService.getOrgKey(this.$route.params.teamId)
      const key = await this.$cryptoService.rsaEncrypt(orgKey.key, pk.buffer)
      return key.encryptedString
    },
    async getPublicKey (user) {
      this.userFingerPrint = ''
      const { public_key: publicKey } = await this.axios.get(`cystack_platform/pm/teams/${this.$route.params.teamId}/members/${user.id}/public_key`)
      return publicKey
    },
    async promptConfirmUser (user) {
      this.selectedUser = user
      this.publicKey = await this.getPublicKey(user)
      const publicKey = Utils.fromB64ToArray(this.publicKey)
      const fingerprint = await this.$cryptoService.getFingerprint(user.pwd_user_id, publicKey.buffer)
      if (fingerprint) {
        this.userFingerPrint = fingerprint.join('-')
      }
      this.dontAskAgain = await this.$storageService.get('autoConfirmFingerprints')
      this.openDialogConfirm()
    },
    openDialogConfirm () {
      this.dialogConfirmVisible = true
    },
    closeDialogConfirm () {
      this.dialogConfirmVisible = false
    },
    async confirmUser (user) {
      try {
        this.loadingConfirm = true
        const key = await this.generateOrgKey()
        await this.axios.post(`cystack_platform/pm/teams/${this.$route.params.teamId}/members/${user.id}`, {
          key
        })
        this.closeDialogConfirm()
        this.getUsers()
        this.notify(this.$t('data.notifications.confirm_member_success'), 'success')
      } catch (e) {
        console.log(e)
        this.notify(this.$t('data.notifications.confirm_member_failed'), 'warning')
      } finally {
        this.loadingConfirm = false
      }
    },
    putUserGroups (user) {
      this.$refs.addEditUserGroups.openDialog(user)
    }
  }
})
</script>
