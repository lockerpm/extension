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
    <div class="text-left">
      <InputText
        v-model="user.username"
        label="Username/Email"
        class="w-full"
        :error-text="errors.username && errors.username[0]"
      />
      <div class="form-group">
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
      <div v-if="['manager', 'member'].includes(user.role)" class="form-group">
        <div>This user can access only the selected folders.</div>
        <el-checkbox-group v-model="user.collections">
          <el-checkbox
            v-for="item in collections"
            :key="item.id"
            :label="item.id"
          >
            {{ item.name }}
          </el-checkbox>
        </el-checkbox-group>
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
      }
    }
  },
  computed: {
    ownershipOptions () {
      return this.teams.filter(e => ['owner', 'admin'].includes(e.role))
    }
  },
  asyncComputed: {
    collections: {
      async get () {
        const collections = await this.$collectionService.getAllDecrypted() || []
        return collections.filter(c => !c.readOnly && c.organizationId === this.$route.params.teamId)
      }
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
    async postUser (user) {
      try {
        this.loading = true
        await this.axios.post(`cystack_platform/pm/teams/${this.$route.params.teamId}/members`, user)
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
        await this.axios.put(`cystack_platform/pm/teams/${this.$route.params.teamId}/members/${user.id}`, user)
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
          await this.axios.delete(`cystack_platform/pm/teams/${this.$route.params.teamId}/members/${user.id}`)
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
    }
  }
})
</script>
