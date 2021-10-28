<template>
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
        {{ user.id ? $t('data.users.edit_family') : $t('data.users.add_family') }}
      </div>
    </div>
    <div class="text-left">
      <InputText
        v-model="user.username"
        label="Username/Email"
        class="w-full !mb-0"
        :error-text="errors.username && errors.username[0]"
      />
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
      user: {
        username: ''
      }
    }
  },
  computed: {
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
        await this.axios.post(`cystack_platform/pm/teams/${this.currentUserPw.default_team_id}/family_members`, {
          username: user.username
        })
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
    async deleteUser (user) {
      this.$confirm(this.$t('data.notifications.delete_member_description'), this.$t('common.warning'), {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(async () => {
        try {
          this.loading = true
          await this.axios.delete(`cystack_platform/pm/teams/${this.currentUserPw.default_team_id}/family_members/${user.id}`)
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
