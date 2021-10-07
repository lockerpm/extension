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
          {{ $t(`data.settings.deauthorize_sessions`) }}
        </div>
      </div>
      <div class="text-left">
        <div class="mb-2">
          {{ $t(`data.settings.deauthorize_sessions_title`) }}
        </div>
        <div class="locker-callout locker-callout-danger mb-5">
          <div>
            {{ $t(`data.settings.deauthorize_sessions_desc`) }}
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
            {{ $t(`common.confirm`) }}
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
        await this.deauthorizeSessions(keyHash)
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
    async deauthorizeSessions (hashedPassword) {
      try {
        await this.axios.post('cystack_platform/pm/users/session/revoke_all', {
          master_password_hash: hashedPassword
        })
        this.closeDialog()
        this.lock()
        this.notify(this.$t('data.settings.deauthorize_sessions_success'), 'success')
      } catch (e) {
        this.notify(this.$t('data.settings.deauthorize_sessions_failed'), 'warning')
      }
    }
  }
})
</script>
