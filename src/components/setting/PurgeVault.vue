<template>
  <div>
    <el-dialog
      :visible.sync="dialogVisible"
      width="575px"
      destroy-on-close
      top="15vh"
      custom-class="locker-dialog"
      :close-on-click-modal="false"
    >
      <div slot="title">
        <div class="text-head-5 text-black-700 font-semibold truncate">
          {{ $t(`data.notifications.${type}_title`) }}
        </div>
      </div>
      <div class="text-left">
        <div class="locker-callout locker-callout-danger mb-5">
          <div class="mb-2 font-semibold text-danger">
            {{ $t(`data.notifications.${type}_title`) }}
          </div>
          <div>
            {{ $t(`data.notifications.${type}_description`) }}
          </div>
        </div>
        <form @submit.prevent="confirmPassword">
          <div class="form-group">
            <InputText
              v-model="password"
              :label="$t('common.master_password')"
              class="w-full"
              :disabled="loading"
              :error-text="errors.password && $t('errors.invalid_password')"
              is-password
              @change="errors = {}"
            />
          </div>
        </form>
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
            class="btn btn-danger"
            :disabled="loading || !password"
            @click="confirmPassword"
          >
            {{ $t(`common.${type}`) }}
          </button>
        </div>
      </div>
    </el-dialog>
  </div>
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
      password: '',
      showPassword: false,
      dialogVisible: false,
      loading: false,
      count: 0,
      errors: {},
      type: 'purge'
    }
  },
  methods: {
    async openDialog (type) {
      this.dialogVisible = true
      this.password = ''
      this.type = type
      this.count = 0
    },
    closeDialog () {
      this.dialogVisible = false
    },
    async confirmPassword () {
      this.loading = true
      this.errors = { }
      const keyHash = await this.$cryptoService.hashPassword(this.password, null)
      const storedKeyHash = await this.$cryptoService.getKeyHash()
      if (storedKeyHash != null && keyHash != null && storedKeyHash === keyHash) {
        if (this.type === 'purge') {
          await this.purgeAccount(keyHash)
        } else {
          await this.deleteAccount(keyHash)
        }
        this.closeDialog()
      } else {
        this.errors = { password: 1 }
        this.count++
        this.$emit('reject')
        if (this.count > 5) {
          this.lock()
        }
      }
      this.loading = false
    },
    async purgeAccount (hashedPassword) {
      try {
        await this.$post('cystack_platform/pm/users/me/purge', {
          master_password_hash: hashedPassword
        })
        this.closeDialog()
        this.notify(this.$t('data.notifications.purge_success'), 'success')
      } catch (e) {
        this.notify(this.$t('data.notifications.purge_failed'), 'warning')
      }
    },
    async deleteAccount (hashedPassword) {
      try {
        await this.$post('cystack_platform/pm/users/me/delete', {
          master_password_hash: hashedPassword
        })
        this.notify(this.$t('data.notifications.delete_account_success'), 'success')
        this.closeDialog()
        this.logout()
      } catch (e) {
        this.notify(this.$t('data.notifications.delete_account_failed'), 'warning')
      }
    }
  }
})
</script>
