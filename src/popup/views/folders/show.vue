<template>
  <div class="show-body">
    <div
      class="create-otp p-4"
      v-loading="callingAPI"
    >
      <div class="text-left bg-white p-4" style="border-radius: 16px">
        <h1 class="create-otp__title text-black-700 text-head-6 font-semibold">
          {{ item ? $t('data.otp.edit.form_title') : $t('data.otp.create.form_title')}}
        </h1>
        <el-form
          class="create-otp__form"
          ref="form"
          :model="form"
          :rules="rules"
        >
          <el-form-item :label="$t('data.otp.create.title')" prop="name">
            <el-input v-model="form.name" :disabled="callingAPI"></el-input>
          </el-form-item>
          <el-form-item v-if="!item" :label="$t('data.otp.create.secret_key')" prop="secretKey">
            <el-input
              class="secret-key"
              v-model="form.secretKey"
              :type="secretKeyInputType"
              :disabled="callingAPI"
            >
              <i
                v-if="form.secretKey && secretKeyInputType === 'password'"
                class="fas fa-eye"
                slot="suffix"
                @click="secretKeyInputType = ''"
              ></i>
              <i
                v-else-if="form.secretKey"
                class="fas fa-eye-slash"
                slot="suffix"
                @click="secretKeyInputType = 'password'"
              ></i>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="create-otp__btn mt-4">
        <el-row type="flex" justify="space-between">
          <div
            v-if="!callingAPI"
            class="menu-icon mr-4 cursor-pointer"
            @click="$router.push({ name: 'folders' })"
          >
            {{$t('common.cancel')}}
          </div>
          <button
            class="btn btn-primary"
            style="border-radius: 100px !important; padding: 10px 24px !important"
            :disabled="callingAPI"
            @click="handleAddEdit"
          >
            {{ $t('common.save') }}
          </button>
        </el-row>
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

import cystackPlatformAPI from '@/api/cystack_platform';

export default {
  name: 'CreateOTP',
  props: {
    item: Object
  },
  components: { },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data () {
    return {
      secretKeyInputType: 'password',
      callingAPI: false,
      form: {
        name: this.item?.name || '',
        secretKey: '',
      },
      rules: {
        name: [
          {
            required: true, message: this.$t('data.otp.message.title_required'), trigger: ['blur', 'change']
          }
        ],
        secretKey: [
          {
            required: true, message: this.$t('data.otp.message.secret_key_required'), trigger: ['blur', 'change']
          }
        ]
      }
    }
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    handleAddEdit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.item) {
            this.updateOTP();
          } else {
            this.createOTP();
          }
        }
      })
    },
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
.create-otp {
  border-top: 1px solid #e5e7eb;
  position: relative;
  height: 100%;
  background-color: #f6f6f6;
  &__form {
    .el-input {
      &.secret-key {
        .el-input__inner {
          padding-right: 45px !important;
        }
        i {
          font-size: 16px;
          color: #374151;
          cursor: pointer;
          margin-right: 12px !important;
        }
      }
    }
  }
}
</style>
