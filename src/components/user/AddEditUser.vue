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
        {{ user.id ? 'Chỉnh sửa người dùng' : 'Mời người dùng' }}
      </div>
    </div>
    <div v-if="inviteByFile && !user.id" class="text-left">
      <div class="form-group flex justify-between">
        <label for="">{{ $t('data.members.invite_member.upload_file') }}</label>
        <div class="cursor-pointer" @click="inviteByFile=false"><span><i class="fas fa-keyboard mr-1" /></span>{{ $t('data.members.enter_email') }}</div>
      </div>
      <div class="flex justify-between">
        <div class="w-5/12" for="">{{ $t('data.members.invite_member.select_format') }}</div>
        <el-select
          v-model="file_format"
          class="w-7/12"
          placeholder=""
          :disabled="loading"
        >
          <el-option
            v-for="item in fileFormats"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </div>
      <div class="flex justify-between mt-3">
        <div class="w-5/12" for="">{{ $t('data.members.invite_member.select_file') }}</div>
        <input
          type="file"
          class="w-7/12 form-control-file form-input mb-4"
          name="file"
          @change="handleFile"
        >
      </div>
      <div v-html="file_template">
        <!-- <a href="/assets/example-import-user.xlsx">
          Download template
        </a> -->
      </div>
      <div v-if="!user.id" class="!break-words !whitespace-normal font-normal text-danger-500 mb-3 mt-2 italic">
        {{ $t(`data.members.invite_member.warning`) }}
      </div>
    </div>
    <div v-else class="text-left">
      <div v-if="!user.id" class="form-group flex justify-between">
        <label for="">{{ $t('data.members.enter_email') }}</label>
        <div class="cursor-pointer" @click="inviteByFile=true"><span><i class="fas fa-cloud-upload-alt mr-1" /></span>{{ $t('data.members.invite_member.by_file') }}</div>
      </div>
      <InputText
        v-model="user.username"
        :label="!user.id?'Email':'Username'"
        class="w-full"
        :error-text="errors.username && errors.username[0]"
        :disabled="user.id?true:false"
      />
      <div v-if="!user.id" class="!break-words !whitespace-normal font-normal text-black-500 mb-3 italic">
        {{ $t(`data.members.invite_member.description`) }}
      </div>
      <div v-if="!user.id" class="!break-words !whitespace-normal font-normal text-danger-500 mb-3 italic">
        {{ $t(`data.members.invite_member.warning`) }}
      </div>
      <div v-if="user.id" class="form-group">
        <el-radio-group v-model="user.role" @change="() => !user.id ? user.collections = [] : null">
          <el-radio
            v-for="item in roleOptions"
            :key="item"
            :label="item"
            class="!flex items-start !break-words !whitespace-normal !mb-4"
          >
            <div>{{ $t(`data.members.role.${item}.title`) }}</div>
            <div class="!break-words !whitespace-normal font-normal text-black-500 mt-2">
              {{ $t(`data.members.role.${item}.description`) }}
            </div>
          </el-radio>
        </el-radio-group>
      </div>
      <div v-if="user.id && ['manager', 'member'].includes(user.role)" class="form-group">
        <div>This user can access only the selected folders.</div>
        <el-table
          :data="tableData"
          style="width: 100%"
        >
          <el-table-column
            label="Name"
            width="300"
          >
            <template slot-scope="scope">
              <el-checkbox
                :key="scope.row.id"
                v-model="scope.row.selected"
                :label="scope.row.id"
              >
                {{ scope.row.name }}
              </el-checkbox>
            </template>
          </el-table-column>
          <el-table-column
            v-if="user.role === 'member'"
            label="Hide Passwords"
            width="130"
          >
            <template slot-scope="scope">
              <el-checkbox
                :key="scope.row.id"
                v-model="scope.row.hide_passwords"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div slot="footer" class="dialog-footer flex items-center text-left">
      <div class="flex-grow" />
      <div>
        <button
          class="btn btn-default"
          @click="dialogVisible = false"
        >
          Cancel
        </button>
        <button
          class="btn btn-primary"
          :disabled="loading"
          @click="user.id ? putUser(user) : postUser(user)"
        >
          {{ user.id ? $t('common.update') : $t('common.add') }}
        </button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import InputText from '@/components/input/InputText'

import cystackPlatformAPI from '@/api/cystack_platform'

export default Vue.extend({
  components: {
    InputText
  },
  data () {
    return {
      loading: false,
      dialogVisible: false,
      errors: {},
      collections: [],
      roleOptions: [
        'admin', 'manager', 'member'
      ],
      user: {
        collections: []
      },
      file: null,
      file_format: '.xlsx',
      inviteByFile: false,
      fileFormats: ['.csv', '.xlsx']
    }
  },
  computed: {
    ownershipOptions () {
      return this.teams.filter(e => ['owner', 'admin'].includes(e.role))
    },
    tableData () {
      let collectionData = this.collections.map(collection => {
        return {
          id: collection.id,
          name: collection.name,
          hide_passwords: false,
          selected: false
        }
      })
      if (this.user.id) {
        collectionData = collectionData.map(item => {
          const collectionUser = this.user.collections.find(collection => collection.id === item.id)
          return collectionUser
            ? {
              ...collectionUser,
              name: item.name,
              selected: true
            }
            : item
        })
      }
      return collectionData
    },
    file_template () {
      if (this.file_format === '.xlsx') {
        return this.$t('data.members.invite_member.xlsx_template')
      }
      if (this.file_format === '.csv') {
        return this.$t('data.members.invite_member.csv_template')
      }
      return ''
    }
  },
  asyncComputed: {
    collections: {
      async get () {
        const collections = await this.$collectionService.getAllDecrypted() || []
        return collections.filter(c => !c.readOnly && c.organizationId === this.$route.params.teamId)
      },
      watch: ['$route.params.teamId']
    }
  },
  methods: {
    async openDialog (user = {}) {
      this.dialogVisible = true
      if (user.id) {
        this.user = { ...user }
      }
    },
    closeDialog () {
      this.dialogVisible = false
    },
    async postUser (user) { // invite multiple
      try {
        this.loading = true
        if (this.file && this.inviteByFile) {
          const formData = new FormData()
          formData.append('members', this.file)
          await cystackPlatformAPI.upload_team_member_file(this.$route.params.teamId, formData)
        } else {
          user.collections = this.tableData.filter(item => item.selected === true)
          user.collections = user.collections.map(item => {
            delete item.name
            return item
          })
          const members = []
          const usernames = user.username.split(',')
          usernames.forEach(username => {
            members.push({
              username: username.trim(),
              role: user.role || 'member',
              collections: user.collections
            })
          })
          const payload = {
            members
          }
          await cystackPlatformAPI.create_team_members(this.$route.params.teamId, payload)
        }
        this.notify(this.$t('data.notifications.add_member_success'), 'success')
        this.closeDialog()
        this.$emit('done')
      } catch (e) {
        console.log(e)
        this.errors = (e.response && e.response.data && e.response.data.details) || {}
        this.notify(this.$t('data.notifications.add_member_failed'), 'warning')
      } finally {
        this.loading = false
      }
    },
    async putUser (user) {
      try {
        this.loading = true
        await cystackPlatformAPI.update_team_member(this.$route.params.teamId, user.id, user)
        this.notify(this.$t('data.notifications.update_member_success'), 'success')
        this.closeDialog()
        this.$emit('done')
      } catch (e) {
        console.log(e)
        this.errors = (e.response && e.response.data && e.response.data.details) || {}
        this.notify(this.$t('data.notifications.update_member_failed'), 'warning')
      } finally {
        this.loading = false
      }
    },
    async deleteUser (user) {
      this.$confirm(this.$t('data.notifications.delete_member_description'), this.$t('common.warning'), {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(async () => {
        try {
          this.loading = true
          await cystackPlatformAPI.delete_team_member(this.$route.params.teamId, user.id)
          this.closeDialog()
          this.$emit('done')
          this.notify(this.$t('data.notifications.delete_member_success'), 'success')
        } catch (e) {
          this.errors = (e.response && e.response.data && e.response.data.details) || {}
          this.notify(this.$t('data.notifications.delete_member_failed'), 'warning')
        } finally {
          this.loading = false
        }
      })
    },
    handleFile (e) {
      if (e.target && e.target.files && e.target.files.length) {
        this.file = e.target.files[0]
      }
    }
  }
})
</script>
