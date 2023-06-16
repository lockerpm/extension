<template>
  <div>
    <el-dialog
      :visible.sync="visible"
      width="435px"
      destroy-on-close
      top="15vh"
      custom-class="locker-dialog"
      :close-on-click-modal="false"
    >
      <div slot="title">
        <div class="text-head-5 text-black-700 font-semibold truncate">
          {{ $t('master_password.enter_password') }}
        </div>
      </div>
      <div class="text-left">
        <form @submit.prevent="confirmPassword">
          <InputText
            v-model="password"
            :label="$t('common.password')"
            class="w-full !mb-0"
            :error-text="errors.password && $t('errors.invalid_password')"
            is-password
            @change="errors = {}"
          />
        </form>
      </div>
      <div slot="footer" class="dialog-footer flex items-center justify-end">
        <div>
          <el-button
            size="small"
            :disabled="callingAPI"
            @click="visible = false"
          >
            {{ $t('common.cancel') }}
          </el-button>
          <el-button
            size="small"
            type="primary"
            :disabled="!password"
            :loading="callingAPI"
            @click="confirmPassword"
          >
            {{ $t('common.confirm') }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import InputText from '../input/InputText'
export default {
  components: {
    InputText
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data () {
    return {
      password: '',
      showPassword: false,
      visible: false,
      callingAPI: false,
      count: 0,
      errors: {}
    }
  },
  computed: {
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async openDialog () {
      this.visible = true
      this.password = ''
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    closeDialog () {
      this.visible = false
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async confirmPassword () {
      this.callingAPI = true
      this.errors = { }
      const keyHash = await this.$cryptoService.hashPassword(this.password, null)
      const storedKeyHash = await this.$cryptoService.getKeyHash()
      if (storedKeyHash != null && keyHash != null && storedKeyHash === keyHash) {
        this.$emit('done')
        this.closeDialog()
      } else {
        this.errors = { password: 1 }
        this.count++
        this.$emit('reject')
        if (this.count > 5) {
          this.lock()
        }
      }
      this.callingAPI = false
    }
  }
}
</script>
