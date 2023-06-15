<template>
  <div class="show-body">
    <div class="p-4">
      <div class="text-left">
        <ValidationProvider
          v-slot="{ errors: err }"
          rules="required"
          :name="$t('data.otp.create.title')"
        >
          <InputText
            v-model="form.name"
            :label="$t('data.otp.create.title')"
            class="w-full"
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
            :label="$t('data.otp.create.secret_key')"
            :error-text="err && err.length && err[0]"
          />
        </ValidationProvider>
      </div>
    </div>
  </div>
</template>

<script>
import { CipherRequest } from 'jslib-common/models/request/cipherRequest'
import { CipherType } from "jslib-common/enums/cipherType";
import { CipherView } from 'jslib-common/models/view/cipherView';
import { Cipher } from 'jslib-common/models/domain/cipher';
import { SecureNote } from 'jslib-common/models/domain/secureNote';

import { ValidationProvider } from 'vee-validate'
import InputText from '@/components/input/InputText';
import cystackPlatformAPI from '@/api/cystack_platform';

export default {
  name: 'CreateOTP',
  props: {
    item: Object
  },
  components: {
    ValidationProvider
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data () {
    return {
      callingAPI: false,
      otp: this.$route.params?.data || {},
      form: {
        name: this.$route.params?.data?.name || '',
        secretKey: '',
      }
    }
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async createOTP () {
      try {
        this.callingAPI = true;
        const cipher = new CipherView()
        cipher.name = this.form.name
        cipher.type = CipherType.SecureNote
        cipher.secureNote = new SecureNote()
        cipher.secureNote.type = 0
        cipher.notes = `otpauth://totp/${encodeURIComponent(this.form.name)}?secret=${this.form.secretKey}&issuer=${encodeURIComponent(this.form.name)}&algorithm=sha1&digits=6&period=30`;
        const cipherEnc = await this.$cipherService.encrypt(cipher)
        const data = new CipherRequest(cipherEnc)
        data.type = CipherType.OTP;
        await cystackPlatformAPI.create_ciphers_vault({
          ...data,
          collectionIds: [],
        })
        this.notify(this.$tc('data.notifications.create_success', 1, { type: this.$t(`type.${CipherType.OTP}`, 1) }), 'success')
        this.$emit('close')
      } catch (e) {
        this.notify(this.$tc('data.notifications.create_failed', 1, { type: this.$t(`type.${CipherType.OTP}`, 1) }), 'warning')
      } finally {
        this.callingAPI = false;
      }
    },

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async updateOTP () {
      if (this.form.name == this.item.name) {
        this.notify(this.$tc('data.notifications.update_success', 1, { type: this.$t(`${CipherType[this.item.type]}`, 1) }), 'success')
        this.$emit('close')
        return
      }
      try {
        this.callingAPI = true;
        const cipher = new Cipher({ ...this.item, name: this.form.name }, true)
        const type_ = this.item.type
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
        this.notify(this.$tc('data.notifications.update_success', 1, { type: this.$t(`${CipherType[this.item.type]}`, 1) }), 'success')
        this.$emit('close')
      } catch (e) {
        this.notify(this.$tc('data.notifications.update_failed', 1, { type: this.$t(`${CipherType[this.item.type]}`, 1) }), 'warning')
      } finally {
        this.callingAPI = false;
      }
    },
  }
}
</script>
<style lang="scss">
</style>
