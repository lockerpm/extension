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
      <div class="flex items-center">
        <div class="text-[34px] mr-3">
          <Vnodes :vnodes="getIconCipher(cipher, 20)" />
        </div>
        <div class="text-black-700 font-semibold">{{ cipher.name }}</div>
      </div>
    </div>
    <div class="text-left">
      <div v-if="isBelongToTeam" class="mb-3">
        {{ $t('data.ciphers.choose_at_least_folder') }}
      </div>
      <div v-else class="mb-3">
        {{ $t('data.ciphers.choose_a_team') }}
      </div>
      <InputSelectTeam
        v-if="!isBelongToTeam && dialogVisible"
        :label="$t('common.ownership')"
        :options="ownershipOptions"
        class="w-full"
        @change="handleChangeOrg"
      />
      <div v-if="cipher.organizationId" class="form-group">
        <div class="flex items-center justify-between" />
        <label>{{ $t('data.ciphers.folders_team') }}</label>
        <el-checkbox-group v-model="cipher.collectionIds" :min="1">
          <el-checkbox
            v-for="(item, index) in writeableCollections"
            :key="index"
            :label="item.id"
          >
            {{ item.name }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <div v-if="cipher.type===CipherType.Login">
        <label class="font-semibold">{{ $t('data.ciphers.show_password') }}</label>
        <el-checkbox
          v-model="cipher.viewPassword"
        >
        </el-checkbox>
      </div>
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
          :disabled="loading || !cipher.collectionIds.length"
          @click="shareCipher(cipher)"
        >
          {{ isBelongToTeam ? $t('common.update') : $t('common.share') }}
        </button>
      </div>
    </div>
  </el-dialog>
</template>

<script>

import InputSelectTeam from '@/components/input/InputSelectTeam'
import {CipherType} from "jslib-common/enums/cipherType";
import {CipherRequest} from "jslib-common/models/request/cipherRequest";
import Vnodes from '@/components/Vnodes'
import Vue from 'vue'
export default Vue.extend({
  components: { InputSelectTeam, Vnodes },
  data () {
    return {
      CipherType,
      cipher: {
        collectionIds: [],
        organizationId: '',
        viewPassword: true
      },
      originCipher: {},
      loading: false,
      dialogVisible: false,
      errors: {},
      writeableCollections: []
    }
  },
  computed: {
    ownershipOptions () {
      return this.teams.filter(e => ['owner', 'admin'].includes(e.role))
    },
    isBelongToTeam () {
      return this.originCipher.organizationId
    },
    passwordStrength () {
      if (this.cipher.login) {
        return this.$passwordGenerationService.passwordStrength(this.cipher.login.password, ['cystack']) || {}
      }
      return {}
    }
  },
  methods: {
    async openDialog (cipher = {}) {
      this.dialogVisible = true
      this.originCipher = { organizationId: '', ...cipher }
      this.cipher = { organizationId: '', ...cipher }
      await this.handleChangeOrg(this.cipher.organizationId)
    },
    closeDialog () {
      this.dialogVisible = false
    },
    async shareCipher (cipher) {
      try {
        this.loading = true
        const cipherEnc = await this.$cipherService.encrypt(cipher)
        const data = new CipherRequest(cipherEnc)
        const url = this.isBelongToTeam ? `cystack_platform/pm/ciphers/${cipher.id}` : `cystack_platform/pm/ciphers/${cipher.id}/share`
        await this.axios.put(url, {
          ...data,
          score: this.passwordStrength.score,
          collectionIds: cipher.collectionIds,
          view_password: cipher.viewPassword
        })
        this.notify(this.$tc('data.notifications.update_success', 1, { type: this.$tc(`type.${CipherType[this.cipher.type]}`, 1) }), 'success')
        this.closeDialog()
        this.$emit('updated-cipher')
      } catch (e) {
        this.notify(this.$tc('data.notifications.update_failed', 1, { type: this.$tc(`type.${CipherType[this.cipher.type]}`, 1) }), 'warning')
        console.log(e)
      } finally {
        this.loading = false
      }
    },
    async generateOrgKey (publicKey) {
      const pk = new Uint8Array(Buffer.from(publicKey, 'base64'))
      const orgKey = await this.$cryptoService.getOrgKey('095ccf45-983d-4fc1-951c-ad330073de93')
      const key = await this.$cryptoService.rsaEncrypt(orgKey.key, pk.buffer)
      return key.encryptedString
    },
    async handleChangeOrg (orgId) {
      this.$set(this.cipher, 'organizationId', orgId)
      this.cipher.folderId = null
      if (orgId) {
        this.writeableCollections = await this.getWritableCollections(orgId)
        if (this.writeableCollections.length && !this.isBelongToTeam) {
          this.cipher.collectionIds = [this.writeableCollections[0].id]
        }
      } else {
        this.cipher.collectionIds = []
      }
    },
    async getWritableCollections (orgId) {
      const allCollections = await this.$collectionService.getAllDecrypted()
      return allCollections.filter(c => !c.readOnly && c.organizationId === orgId)
    }
  }
})
</script>
