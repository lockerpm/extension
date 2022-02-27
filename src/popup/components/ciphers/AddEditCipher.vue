<template>
  <div style="max-width: 400px" class="mx-auto">
    <div class="relative mx-auto" style="padding-top: 44px;">
      <div
        class="flex items-center bg-black-300 cursor-pointer h-[44px] leading-[44px] px-5 justify-between fixed top-0"
        style="z-index: 1; width: 400px"
      >
        <div class="menu-icon mr-4" @click="$router.back()">
          <i class="fas fa-chevron-left text-[20px]"></i> Back
        </div>
        <div>Add item</div>
        <div v-if="cipher.id" @click="putCipher(cipher)">
          Update
        </div>
        <div v-else @click="postCipher(cipher)">
          Save
        </div>
      </div>
    </div>
    <div class="text-left px-3 py-5">
      <el-select
          v-model="cipher.type"
          placeholder=""
          class="w-full mb-3"
          :change="handleChangeType"
        >
          <el-option
            v-for="(item, index) in typeOptions"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      <ValidationProvider
        v-slot="{ errors: err }"
        rules="required"
        :name="$t('common.name')"
      >
        <InputText
          v-model="cipher.name"
          :label="$t('common.name')"
          class="w-full"
          :error-text="err && err.length && err[0]"
          :disabled="isDeleted"
          required
        />
      </ValidationProvider>

      <template v-if="cipher.type === CipherType.Login">
        <div class="mb-4 text-black-700 text-head-6 font-semibold">
          {{ $t('data.ciphers.login') }}
        </div>
        <InputText
          v-model="cipher.login.username"
          label="Email / Username"
          class="w-full"
          :disabled="isDeleted"
        />
        <template>
          <InputText
            v-model="cipher.login.password"
            :label="$t('data.ciphers.password')"
            class="w-full"
            :disabled="isDeleted"
            is-password
          />
          <PasswordStrengthBar
            :score="passwordStrength.score"
            class="mt-2"
          />
          <div
            v-if="!isDeleted && !cipher.id"
            class="text-right"
          >
            <el-popover
              placement="right"
              width="280"
              trigger="click"
              popper-class="locker-pw-generator"
            >
              <PasswordGenerator @generated="setPassword" />

              <button
                slot="reference"
                class="btn btn-clean !text-primary"
              >
                {{ $t('data.ciphers.generate_random_password') }}
              </button>
            </el-popover>
          </div>
        </template>
        <template v-for="(item, index) in cipher.login.uris">
          <InputText
            :key="index"
            v-model="item.uri"
            :label="$t('data.ciphers.website_address')"
            class="w-full"
            :disabled="isDeleted"
          />
        </template>
      </template>
      <template v-if="cipher.type === CipherType.Card">
        <div class="mb-4 text-black-700 text-head-6 font-semibold">Chi tiết thẻ</div>
        <ValidationProvider
          v-slot="{ errors: err }"
          rules="required"
          :name="$t('data.ciphers.card_holder')"
        >
          <InputText
            v-model="cipher.card.cardholderName"
            :label="$t('data.ciphers.card_holder')"
            class="w-full !mb-2"
            :error-text="err && err.length && err[0]"
            :disabled="isDeleted"
            required
          />
        </ValidationProvider>
        <InputSelect
          :label="$t('data.ciphers.brand')"
          :initial-value="cipher.card.brand"
          class="w-full"
          :disabled="isDeleted"
          :options="cardBrandOptions"
          @change="(v) => cipher.card.brand = v"
        />
        <InputText
          v-model="cipher.card.number"
          :label="$t('data.ciphers.card_number')"
          class="w-full"
          :disabled="isDeleted"
        />
        <div class="grid grid-cols-2 gap-2">
          <InputSelect
            :label="$t('data.ciphers.expiration_month')"
            :initial-value="cipher.card.expMonth"
            class="w-full"
            :disabled="isDeleted"
            :options="cardExpMonthOptions"
            @change="(v) => cipher.card.expMonth = v"
          />
          <InputText
            v-model="cipher.card.expYear"
            :label="$t('data.ciphers.expiration_year')"
            class="w-full !mb-2"
            :disabled="isDeleted"
          />
        </div>
        <InputText
          v-model="cipher.card.code"
          :label="$t('data.ciphers.cvv')"
          is-password
          class="w-full"
          :disabled="isDeleted"
        />
      </template>
      <template v-if="cipher.type === CipherType.Identity">
        <div class="mb-4 text-black-700 text-head-6 font-semibold">
          {{ $t('data.ciphers.personal') }}
        </div>
        <div class="grid grid-cols-2 gap-x-2 mb-4">
          <InputSelect
            :label="$t('data.ciphers.title')"
            :initial-value="cipher.identity.title"
            class="w-full"
            :disabled="isDeleted"
            :options="identityTitleOptions"
            @change="(v) => cipher.identity.title = v"
          />
          <InputText
            v-model="cipher.identity.firstName"
            :label="$t('data.ciphers.first_name')"
            class="w-full"
            :disabled="isDeleted"
          />
          <InputText
            v-model="cipher.identity.lastName"
            :label="$t('data.ciphers.last_name')"
            class="w-full"
            :disabled="isDeleted"
          />
          <InputText
            v-model="cipher.identity.username"
            label="Username"
            class="w-full"
            :disabled="isDeleted"
          />
          <InputText
            v-model="cipher.identity.company"
            :label="$t('data.ciphers.company')"
            class="w-full"
            :disabled="isDeleted"
          />
          <InputText
            v-model="cipher.identity.email"
            label="Email"
            class="w-full"
            :disabled="isDeleted"
          />
          <InputText
            v-model="cipher.identity.phone"
            :label="$t('data.ciphers.phone')"
            class="w-full"
            :disabled="isDeleted"
          />
          <InputText
            v-model="cipher.identity.ssn"
            :label="$t('data.ciphers.ssn')"
            class="w-full"
            :disabled="isDeleted"
          />
          <InputText
            v-model="cipher.identity.passportNumber"
            :label="$t('data.ciphers.passport')"
            class="w-full"
            :disabled="isDeleted"
          />
          <InputText
            v-model="cipher.identity.licenseNumber"
            :label="$t('data.ciphers.license')"
            class="w-full !mb-2"
            :disabled="isDeleted"
          />
        </div>
        <div class="mb-4 text-black-700 text-head-6 font-semibold">Thông tin liên lạc</div>
        <div class="grid grid-cols-2 gap-x-2 mb-4">
          <InputText
            v-model="cipher.identity.address1"
            :label="$t('data.ciphers.address') + '1'"
            class="w-full col-span-2"
            :disabled="isDeleted"
          />
          <InputText
            v-model="cipher.identity.address2"
            :label="$t('data.ciphers.address') + '2'"
            class="w-full col-span-2"
            :disabled="isDeleted"
          />
          <InputText
            v-model="cipher.identity.city"
            :label="$t('data.ciphers.city_town')"
            class="w-full col-span-2"
            :disabled="isDeleted"
          />
          <InputText
            v-model="cipher.identity.state"
            :label="$t('data.ciphers.state_province')"
            class="w-full col-span-2"
            :disabled="isDeleted"
          />
          <InputText
            v-model="cipher.identity.postalCode"
            :label="$t('data.ciphers.zip')"
            class="w-full col-span-2"
            :disabled="isDeleted"
          />
          <InputText
            v-model="cipher.identity.country"
            :label="$t('data.ciphers.country')"
            class="w-full col-span-2 !mb-2"
            :disabled="isDeleted"
          />
        </div>
      </template>
      <div
        v-if="cipher.type !== CipherType.SecureNote"
        class="my-5 text-black-700 text-head-6 font-semibold"
      >
        {{ $t('data.ciphers.others') }}
      </div>
      <InputText
        v-model="cipher.notes"
        :label="$t('data.ciphers.notes')"
        class="w-full"
        :disabled="isDeleted"
        is-textarea
      />
      <InputSelectFolder
        :label="$t('data.folders.select_folder')"
        :initial-value="cipher.folderId"
        :options="folders"
        :disabled="isDeleted"
        class="w-full"
        @change="(v) => cipher.folderId = v"
        @addFolder="addFolder(false)"
      />
      <template v-if="ownershipOptions.length">
        <InputSelectOrg
          :label="$t('common.ownership')"
          :initial-value="cipher.organizationId"
          :options="ownershipOptions"
          :disabled="isDeleted || !!cipher.id"
          class="w-full"
          @change="(v) => {
              cipher.organizationId = v;
              handleChangeOrg(v)
            }"
        />
        <div
          v-if="cipher.organizationId"
          class="form-group"
        >
          <div class="flex items-center justify-between" />
          <label>{{ $t('data.ciphers.folders_team') }}</label>
          <div class="mb-2">
            {{ $t('data.ciphers.choose_at_least_folder') }}
          </div>
          <el-checkbox-group
            v-model="cipher.collectionIds"
            :min="1"
            :disabled="isDeleted"
          >
            <el-checkbox
              v-for="(item, index) in writeableCollections"
              :key="index"
              :label="item.id"
            >
              {{ item.name }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </template>
    </div>
    <AddEditFolder ref="addEditFolder" @created-folder="handleCreatedFolder" />
  </div>
</template>

<script>
import Vue from 'vue'
import { Dialog } from 'element-ui'
import { ValidationProvider} from 'vee-validate'
import { CipherType } from "jslib-common/enums/cipherType";
import { SecureNoteType } from "jslib-common/enums/secureNoteType";
import { Cipher } from 'jslib-common/models/domain/cipher'
import { CipherRequest } from 'jslib-common/models/request/cipherRequest'
import { CipherView } from "jslib-common/models/view/cipherView";
import { SecureNoteView } from "jslib-common/models/view/secureNoteView";
import { IdentityView } from "jslib-common/models/view/identityView";
import { CardView } from "jslib-common/models/view/cardView";
import { LoginUriView } from "jslib-common/models/view/loginUriView";
import { LoginView } from "jslib-common/models/view/loginView";
import AddEditFolder from '@/popup/components/folder/AddEditFolder'
import PasswordGenerator from '@/components/password/PasswordGenerator'
import PasswordStrengthBar from '@/components/password/PasswordStrengthBar'
import InputText from '@/components/input/InputText'
import InputSelect from '@/components/input/InputSelect'
import InputSelectFolder from '@/components/input/InputSelectFolder'
import InputSelectOrg from '@/components/input/InputSelectOrg'
import { BrowserApi } from "@/browser/browserApi";
export default Vue.extend({
  components: {
    PasswordGenerator,
    ValidationProvider,
    PasswordStrengthBar,
    InputText,
    InputSelect,
    InputSelectFolder,
    InputSelectOrg,
    AddEditFolder
  },
  props: {
    type: {
      type: String,
      default: null
    },
    routeName: {
      type: String,
      default: ''
    },
    data: {
      type: CipherView,
      default: new CipherView()
    },
    password: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      cipher: new CipherView(),
      folders: [],
      showPassword: false,
      showCardCode: false,
      dialogVisible: false,
      loading: false,
      CipherType,
      errors: {},
      writeableCollections: [],
      cloneMode: false,
    }
  },
  async mounted() {
    this.folders = await this.getFolders()
    if (this.data.id) {
      this.cipher = new Cipher({ ...this.data }, true)
      this.writeableCollections = await this.getWritableCollections(this.cipher.organizationId)
    } else if (CipherType[this.type]) {
      this.newCipher(this.type, this.data)
    } else {
      this.newCipher('Login', this.data)
      if(this.password){
        this.cipher.login.password = this.password
      }
      this.cipher.name = (await BrowserApi.getTabFromCurrentWindow()).url;
      this.cipher.login.uris[0].uri = this.cipher.name
    }
  },
  computed: {
    typeOptions () {
      return [
        { label: this.$tc('type.Login', 1), value: CipherType.Login },
        { label: this.$tc('type.Card', 1), value: CipherType.Card },
        { label: this.$tc('type.Identity', 1), value: CipherType.Identity },
        { label: this.$tc('type.SecureNote', 1), value: CipherType.SecureNote }
      ]
    },
    cardBrandOptions () {
      return [
        { label: '----', value: null },
        { label: 'Visa', value: 'Visa' },
        { label: 'Mastercard', value: 'Mastercard' },
        { label: 'American Express', value: 'Amex' },
        { label: 'Discover', value: 'Discover' },
        { label: 'Diners Club', value: 'Diners Club' },
        { label: 'JCB', value: 'JCB' },
        { label: 'Maestro', value: 'Maestro' },
        { label: 'UnionPay', value: 'UnionPay' },
        { label: this.$t('other'), value: 'Other' }
      ]
    },
    cardExpMonthOptions () {
      return [
        { label: '----', value: null },
        { label: '01 - ' + this.$t('january'), value: '1' },
        { label: '02 - ' + this.$t('february'), value: '2' },
        { label: '03 - ' + this.$t('march'), value: '3' },
        { label: '04 - ' + this.$t('april'), value: '4' },
        { label: '05 - ' + this.$t('may'), value: '5' },
        { label: '06 - ' + this.$t('june'), value: '6' },
        { label: '07 - ' + this.$t('july'), value: '7' },
        { label: '08 - ' + this.$t('august'), value: '8' },
        { label: '09 - ' + this.$t('september'), value: '9' },
        { label: '10 - ' + this.$t('october'), value: '10' },
        { label: '11 - ' + this.$t('november'), value: '11' },
        { label: '12 - ' + this.$t('december'), value: '12' }
      ]
    },
    identityTitleOptions () {
      return [
        { label: '-- ' + this.$t('select') + ' --', value: null },
        { label: this.$t('mr'), value: this.$t('mr') },
        { label: this.$t('mrs'), value: this.$t('mrs') },
        { label: this.$t('ms'), value: this.$t('ms') },
        { label: this.$t('dr'), value: this.$t('dr') }
      ]
    },
    isDeleted () {
      return !!this.cipher.deletedDate
    },
    passwordStrength () {
      if (this.cipher.login) {
        return this.$passwordGenerationService.passwordStrength(this.cipher.login.password, ['cystack']) || {}
      }
      return {}
    },
    ownershipOptions () {
      const teams = this.teams.filter(e => ['owner', 'admin'].includes(e.role))
      if (teams.length) {
        return [{ name: this.currentUser.email, organization_id: null }, ...teams]
      }
      return []
    }
  },
  methods: {
    async postCipher (cipher) {
      if (!cipher.name) { return }
      try {
        this.loading = true
        this.errors = {}
        const cipherEnc = await this.$cipherService.encrypt(cipher)
        const data = new CipherRequest(cipherEnc)
        await this.axios.post('cystack_platform/pm/ciphers/vaults', {
          ...data,
          score: this.passwordStrength.score,
          collectionIds: cipher.collectionIds,
          // view_password: cipher.viewPassword
        })
        this.notify(this.$tc('data.notifications.create_success', 1, { type: this.$tc(`type.${this.cipher.type}`, 1) }), 'success')
        this.$router.push({name: 'vault'})
      } catch (e) {
        this.notify(this.$tc('data.notifications.create_failed', 1, { type: this.$tc(`type.${this.cipher.type}`, 1) }), 'warning')
        this.errors = (e.response && e.response.data && e.response.data.details) || {}
        // this.notify(e, 'warning')
      } finally {
        this.loading = false
      }
    },
    async putCipher (cipher) {
      try {
        const cipherEnc = await this.$cipherService.encrypt(cipher)
        const data = new CipherRequest(cipherEnc)
        await this.axios.put(`cystack_platform/pm/ciphers/${cipher.id}`, {
          ...data,
          score: this.passwordStrength.score,
          collectionIds: cipher.collectionIds,
          // view_password: cipher.viewPassword
        })
        this.notify(this.$tc('data.notifications.update_success', 1, { type: this.$tc(`type.${CipherType[this.cipher.type]}`, 1) }), 'success')
        // this.$emit('updated-cipher')
        this.$router.push({name: 'vault'})
      } catch (e) {
        this.notify(this.$tc('data.notifications.update_failed', 1, { type: this.$tc(`type.${CipherType[this.cipher.type]}`, 1) }), 'warning')
      } finally {
        this.loading = false
      }
    },
    async deleteCiphers (ids) {
      this.$confirm(this.$tc('data.notifications.delete_selected_desc', ids.length), this.$t('common.warning'), {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(async () => {
        try {
          this.loading = true
          await this.axios.put('cystack_platform/pm/ciphers/permanent_delete', { ids })
          this.notify(this.$tc('data.notifications.delete_success', ids.length, { type: this.$tc('type.0', ids.length) }), 'success')
          this.$emit('reset-selection')
        } catch (e) {
          this.notify(this.$tc('data.notifications.delete_failed', ids.length, { type: this.$tc('type.0', ids.length) }), 'warning')
          console.log(e)
        } finally {
          this.loading = false
        }
      })
    },
    async moveTrashCiphers (ids) {
      this.$confirm(this.$tc('data.notifications.trash_selected_desc', ids.length, { count: ids.length }), this.$t('common.warning'), {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(async () => {
        try {
          this.loading = true
          await this.axios.put('cystack_platform/pm/ciphers/delete', { ids })
          this.notify(this.$tc('data.notifications.trash_success', ids.length, { type: this.$tc('type.0', ids.length) }), 'success')
          this.$emit('trashed-cipher')
        } catch (e) {
          this.notify(this.$tc('data.notifications.trash_failed', ids.length, { type: this.$tc('type.0', ids.length) }), 'warning')
          this.$emit('reset-selection')
        } finally {
          this.loading = false
        }
      })
    },
    async restoreCiphers (ids) {
      this.$confirm(this.$tc('data.notifications.restore_selected_desc', ids.length), this.$t('common.warning'), {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(async () => {
        try {
          this.loading = true
          await this.axios.put('cystack_platform/pm/ciphers/restore', { ids })
          this.notify(this.$tc('data.notifications.restore_success', ids.length, { type: this.$tc('type.0', ids.length) }), 'success')
          this.$emit('reset-selection')
        } catch (e) {
          this.notify(this.$tc('data.notifications.restore_failed', ids.length, { type: this.$tc('type.0', ids.length) }), 'warning')
          console.log(e)
        } finally {
          this.loading = false
        }
      })
    },
    addFolder (shouldRedirect = false) {
      this.$refs.addEditFolder.openDialog({}, shouldRedirect)
    },
    async handleCreatedFolder (folder) {
      this.folders.push(folder)
      this.cipher.folderId = folder.id
    },
    newCipher (type, data) {
      this.cipher = new CipherView()
      this.cipher.organizationId = data.organizationId ? data.organizationId : null
      this.cipher.type = CipherType[type]
      this.cipher.login = new LoginView()
      this.cipher.login.uris = [new LoginUriView()]
      this.cipher.card = new CardView()
      this.cipher.identity = new IdentityView()
      this.cipher.secureNote = new SecureNoteView()
      this.cipher.secureNote.type = SecureNoteType.Generic
      this.cipher.folderId = this.$route.params.folderId || null
      this.cipher.collectionIds = this.$route.params.tfolderId ? [this.$route.params.tfolderId] : []
      if (this.cipher.organizationId) {
        this.handleChangeOrg(this.cipher.organizationId)
      }
    },
    handleChangeType (type) {
      this.newCipher(type)
    },
    async handleChangeOrg (orgId) {
      this.cipher.folderId = null
      if (orgId) {
        this.writeableCollections = await this.getWritableCollections(orgId)
        if (this.writeableCollections.length) {
          this.cipher.collectionIds = [this.writeableCollections[0].id]
        }
      } else {
        this.cipher.collectionIds = []
      }
    },
    async getWritableCollections (orgId) {
      const allCollections = await this.$collectionService.getAllDecrypted()
      return allCollections.filter(c => !c.readOnly && c.organizationId === orgId)
    },
    setPassword(p){
      if(!this.cipher.login.password){
        this.cipher.login.password = p
      }
    }
  }
}
)
</script>
