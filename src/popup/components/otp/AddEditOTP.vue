<template>
  <div class="create-otp p-4" v-loading="callingAPI">
    <div class="text-left bg-white p-4" style="border-radius: 16px">
      <h1 class="create-otp__title text-black-700 text-head-6 font-semibold">
        {{ item ? 'Update OTP title' : 'Input secret key manually'}}
      </h1>
      <el-form
        class="create-otp__form"
        ref="form"
        :model="form"
        :rules="rules"
      >
        <el-form-item label="Title" prop="name">
          <el-input v-model="form.name" :disabled="callingAPI"></el-input>
        </el-form-item>
        <el-form-item v-if="!item" label="Secret key" prop="secretKey">
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
          @click="$emit('close')"
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
</template>

<script>
import { CipherRequest } from 'jslib-common/models/request/cipherRequest'
import { CipherType } from "jslib-common/enums/cipherType";
import { SecureNoteView } from 'jslib-common/models/view/secureNoteView';
import { CipherView } from 'jslib-common/models/view/cipherView';
import { Cipher } from 'jslib-common/models/domain/cipher';
import { SecureNote } from 'jslib-common/models/domain/secureNote';
import { SecureNoteType } from 'jslib-common/enums/secureNoteType';

export default {
  name: 'CreateOTP',
  props: {
    item: Object
  },
  components: { },
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
            required: true, message: 'Title is required', trigger: ['blur', 'change']
          }
        ],
        secretKey: [
          {
            required: true, message: 'Secret key is required', trigger: ['blur', 'change']
          }
        ]
      }
    }
  },
  methods: {
    newCipher () {
      this.cipher = new CipherView()
      this.cipher.type = CipherType.OTP
      this.cipher.secureNote = new SecureNoteView()
      this.cipher.secureNote.type = SecureNoteType.Generic
    },
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
    async createOTP () {
      try {
        this.callingAPI = true;
        const  { cipher } = new this.newCipher('OTP');
        cipher.name = this.form.name;
        cipher.notes = ''
        console.log(cipher);
        // const cipherEnc = await this.$cipherService.encrypt(cipher)
        // const data = new CipherRequest(cipherEnc)

        // await this.axios.put(`cystack_platform/pm/ciphers/${cipher.id}`, {
        //   ...data,
        //   collectionIds: []
        // })
        // this.notify(this.$tc('data.notifications.create_success', 1, { type: this.$t(`${CipherType[this.item.type]}`, 1) }), 'success')
        // this.$emit('close')
      } catch (e) {
        this.notify(this.$tc('data.notifications.create_failed', 1, { type: this.$t(`${CipherType[this.item.type]}`, 1) }), 'warning')
      } finally {
        this.callingAPI = false;
      }
    },

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

        await this.axios.put(`cystack_platform/pm/ciphers/${cipher.id}`, {
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
