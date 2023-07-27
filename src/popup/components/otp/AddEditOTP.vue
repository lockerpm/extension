<template>
  <el-dialog
    :visible.sync="visible"
    :title="title"
    width="85%"
    destroy-on-close
    append-to-body
    custom-class="locker-dialog"
  >
    <div class="text-left">
      <ValidationProvider
        v-slot="{ errors: err }"
        rules="required"
        :name="$t('data.otp.create.title')"
      >
        <InputText
          v-model="form.name"
          class="w-full"
          required
          :bottom-border="true"
          :label="$t('data.otp.create.title')"
          :error-text="err && err.length && err[0]"
        />
      </ValidationProvider>
      <ValidationProvider
        v-if="!otp.id"
        v-slot="{ errors: err }"
        rules="required"
        :name="$t('data.otp.create.secret_key')"
      >
        <InputText
          v-model="form.secretKey"
          class="w-full"
          is-password
          required
          :bottom-border="true"
          :label="$t('data.otp.create.secret_key')"
          :error-text="err && err.length && err[0]"
        />
      </ValidationProvider>
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
          :loading="callingAPI"
          :disabled="!form.secretKey || !form.name"
          @click="handleSave"
        >
          {{ otp.id ? $t('common.update') : $t('common.add') }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import InputText from '@/components/input/InputText'

import { ValidationProvider } from 'vee-validate'
import { CipherRequest } from 'jslib-common/models/request/cipherRequest'
import { CipherType } from "jslib-common/enums/cipherType";
import { Cipher } from 'jslib-common/models/domain/cipher';
import { SecureNote } from 'jslib-common/models/domain/secureNote';

import cystackPlatformAPI from '@/api/cystack_platform';

export default Vue.extend({
  components: {
    InputText,
    ValidationProvider
  },
  data () {
    return {
      callingAPI: false,
      visible: false,
      otp: {},
      errors: {},
      form: {
        name: '',
        secretKey: '',
      },
    }
  },
  computed: {
    title() {
      if (this.otp.id) {
        return this.$t('common.edit') + ' ' + this.$t('data.parts.otp')
      }
      return this.$t('common.add') + ' ' + this.$t('data.parts.otp')
    }
  },
  methods: {
    openDialog (otp = {}) {
      this.visible = true
      this.otp = otp || {}
      this.form.name = otp.name || ''
      this.form.secretKey = otp.notes || ''
    },
    async handleSave () {
      if (this.otp.id) {
        await this.updateOTP()
      } else {
        await this.createOTP()
      }
    },
    async createOTP () {
      try {
        this.callingAPI = true;
        await this.createAuthenticator(this.form)
        this.notify(this.$tc('data.notifications.create_success', 1, { type: this.$t(`type.${CipherType.OTP}`, 1) }), 'success')
        this.visible = false
      } catch (e) {
        this.notify(this.$tc('data.notifications.create_failed', 1, { type: this.$t(`type.${CipherType.OTP}`, 1) }), 'warning')
      } finally {
        this.callingAPI = false;
      }
    },

    async updateOTP () {
      if (this.form.name == this.otp.name) {
        this.notify(this.$tc('data.notifications.update_success', 1, { type: this.$t(`${CipherType[this.otp.type]}`, 1) }), 'success')
        this.visible = false
        return
      }
      try {
        this.callingAPI = true;
        const cipher = new Cipher({ ...this.otp, name: this.form.name }, true)
        const type_ = this.otp.type
        if (cipher.type === CipherType.OTP) {
          cipher.type = CipherType.SecureNote
          cipher.secureNote = new SecureNote(cipher.secureNote, true)
          cipher.secureNote.type = 0
        }

        // Encrypt cipher
        const cipherEnc = await this.$cipherService.encrypt(cipher)
        const data = new CipherRequest(cipherEnc)

        // Change type back after encryption
        data.type = type_
        cipher.type = type_

        await cystackPlatformAPI.update_cipher(cipher.id, {
          ...data,
          collectionIds: []
        })
        this.notify(this.$tc('data.notifications.update_success', 1, { type: this.$t(`${CipherType[this.otp.type]}`, 1) }), 'success')
        this.visible = false
      } catch (e) {
        this.notify(this.$tc('data.notifications.update_failed', 1, { type: this.$t(`${CipherType[this.otp.type]}`, 1) }), 'warning')
      } finally {
        this.callingAPI = false;
      }
    },
  }
}
)
</script>
