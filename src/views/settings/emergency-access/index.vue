<template>
  <div class="flex flex-col flex-column-fluid relative bg-[#FBFBFC]">
    <div class="flex-column-fluid py-10 mb-20">
      <div class="text-head-5 font-semibold mb-4">
        Emergency Access
      </div>
      <div class="setting-description mb-5">
        {{ $t('data.emergency_access.emergency_access_desc') }}
      </div>
      <div class="setting-wrapper">
        <div class="setting-section">
          <div class="setting-section-header">
            <div>
              <div class="setting-title">{{ $t('data.emergency_access.trusted_emergency_contacts') }}</div>
            </div>
            <div>
              <button
                class="btn btn-default !text-warning"
                @click="postEmergencyAccess"
              >
                {{ $t('data.emergency_access.add_emergency_contact') }}
              </button>
            </div>
          </div>
          <div class="setting-section-body">
              <el-table
                v-loading="loading"
                :data="list_trusted"
                style="width: 100%"
              >
                <el-table-column label="Users">
                  <template slot-scope="scope">
                    <div class="flex items-center">
                      <el-avatar
                        :src="scope.row.avatar"
                        :size="32"
                      />
                      <div class="ml-2">
                        <div class="text-black font-semibold truncate">{{ scope.row.email }}</div>
                        <div v-if="scope.row.full_name">{{ scope.row.full_name }}</div>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  label="Status"
                  align="right"
                >
                  <template slot-scope="scope">
                    <span
                      class="label capitalize"
                      :class="{'label-primary-light': scope.row.status === 'confirmed',
                               'label-success-light': scope.row.status === 'accepted',
                               'label-warning-light': scope.row.status === 'invited',
                               'label-danger-light': scope.row.status === 'expired',
                               'label-info-light': scope.row.status === 'recovery_initiated',
                               'label-success-light': scope.row.status === 'recovery_approved',
                      }"
                    >
                      {{ scope.row.status }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  label="Type"
                  align="right"
                >
                  <template slot-scope="scope">
                    {{ scope.row.type }}
                  </template>
                </el-table-column>
                <el-table-column align="right">
                  <template slot-scope="scope">
                    <el-dropdown
                      trigger="click"
                      :hide-on-click="false"
                    >
                      <button class="btn btn-icon btn-xs hover:bg-black-400">
                        <i class="fas fa-ellipsis-h" />
                      </button>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item
                          v-if="scope.row.status === 'invited'"
                          @click.native="reinvite(scope.row)"
                        >
                          <span class="text-success">{{ $t('common.reinvite') }}</span>
                        </el-dropdown-item>
                        <el-dropdown-item
                          v-if="scope.row.status === 'accepted'"
                          @click.native="promptConfirmEmergencyAccess(scope.row)"
                        >
                          <span class="text-success">{{ $t('common.confirm') }}</span>
                        </el-dropdown-item>
                        <template v-if="scope.row.status === 'confirmed'">
                          <el-dropdown-item @click.native="putEmergencyAccess(scope.row)">
                            {{ $t('common.edit') }}
                          </el-dropdown-item>
                        </template>
                        <template v-if="scope.row.status === 'recovery_initiated'">
                          <el-dropdown-item @click.native="approveEmergencyAccess(scope.row)">
                            {{ $t('common.accept') }}
                          </el-dropdown-item>
                          <el-dropdown-item @click.native="rejectEmergencyAccess(scope.row)">
                            {{ $t('common.reject') }}
                          </el-dropdown-item>
                        </template>
                        <el-dropdown-item
                          v-if="scope.row.status === 'recovery_approved'"
                          @click.native="rejectEmergencyAccess(scope.row)"
                        >
                          <span class="text-success">{{ $t('common.reject') }}</span>
                        </el-dropdown-item>
                        <el-dropdown-item @click.native="deleteEmergencyAccess(scope.row)">
                          <span class="text-danger">
                            {{ $t('common.remove') }}
                          </span>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </template>
                </el-table-column>
              </el-table>
          </div>
        </div>
        <div class="setting-section">
          <div class="setting-section-header">
            <div>
              <div class="setting-title">{{ $t('data.emergency_access.designated_emergency_contacts') }}</div>
            </div>
          </div>
          <div class="setting-section-body">
              <el-table
                v-loading="loading"
                :data="list_granted"
                style="width: 100%"
              >
                <el-table-column label="Users">
                  <template slot-scope="scope">
                    <div class="flex items-center">
                      <el-avatar
                        :src="scope.row.avatar"
                        :size="32"
                      />
                      <div class="ml-2">
                        <div class="text-black font-semibold truncate">{{ scope.row.email }}</div>
                        <div v-if="scope.row.full_name">{{ scope.row.full_name }}</div>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  label="Status"
                  align="right"
                >
                  <template slot-scope="scope">
                    <span
                      class="label capitalize"
                      :class="{'label-primary-light': scope.row.status === 'confirmed',
                               'label-success-light': scope.row.status === 'accepted',
                               'label-warning-light': scope.row.status === 'invited',
                               'label-danger-light': scope.row.status === 'expired',
                               'label-info-light': scope.row.status === 'recovery_initiated',
                               'label-success-light': scope.row.status === 'recovery_approved',
                      }"
                    >
                      {{ scope.row.status }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  label="Type"
                  align="right"
                >
                  <template slot-scope="scope">
                    {{ scope.row.type }}
                  </template>
                </el-table-column>
                <el-table-column align="right">
                  <template slot-scope="scope">
                    <el-dropdown
                      trigger="click"
                      :hide-on-click="false"
                    >
                      <button class="btn btn-icon btn-xs hover:bg-black-400">
                        <i class="fas fa-ellipsis-h" />
                      </button>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item
                          v-if="scope.row.status==='invited'"
                          @click.native="acceptInvite(scope.row)"
                        >
                          {{ $t('common.accept') }}
                        </el-dropdown-item>
                        <template v-if="scope.row.status === 'confirmed'">
                          <el-dropdown-item @click.native="requestAccess(scope.row)">
                            {{ $t('common.request_access') }}
                          </el-dropdown-item>
                        </template>
                        <el-dropdown-item
                          v-if="scope.row.status === 'recovery_approved' && scope.row.type==='view'"
                          @click.native="viewGrantorVault(scope.row)"
                        >
                          <span class="text-success">{{ $t('common.view') }}</span>
                        </el-dropdown-item>
                        <el-dropdown-item
                          v-if="scope.row.status === 'recovery_approved' && scope.row.type==='takeover'"
                          @click.native="takeoverGrantorVault(scope.row)"
                        >
                          <span class="text-success">{{ $t('common.takeover') }}</span>
                        </el-dropdown-item>
                        <el-dropdown-item @click.native="deleteEmergencyAccess(scope.row)">
                          <span class="text-danger">
                            {{ $t('common.remove') }}
                          </span>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </template>
                </el-table-column>
              </el-table>
          </div>
        </div>
      </div>
    </div>
    <EmergencyContact
      ref="emergencyContact"
      @done="getEmergencyAccess"
    />
    <el-dialog
      :visible.sync="dialogConfirmVisible"
      width="435px"
      destroy-on-close
      top="15vh"
      custom-class="locker-dialog"
      :close-on-click-modal="false"
    >
      <div slot="title">
        <div class="text-head-5 text-black-700 font-semibold truncate">
          {{ $t('data.notifications.fingerprint_title') }}
        </div>
      </div>
      <div class="text-left">
        <div class="text-head-6 mb-4">{{ $t('data.notifications.fingerprint_description_1') }}</div>
        <div class="text-danger-400 bg-black-200 bg-opacity-50 rounded px-4 py-2 mb-4">
          {{ userFingerPrint }}
        </div>
        <div class="text-sm">{{ $t('data.notifications.fingerprint_description_2') }}</div>
      </div>
      <div
        slot="footer"
        class="dialog-footer flex items-center text-left"
      >
        <div class="flex-grow" />
        <div>
          <button
            class="btn btn-default"
            @click="dialogConfirmVisible = false"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            class="btn btn-primary"
            :disabled="loadingConfirm"
            @click="confirmEmergencyAccess(selectedEmergencyAccess)"
          >
            {{ $t('common.confirm') }}
          </button>
        </div>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="dialogTakeoverVisible"
      width="435px"
      destroy-on-close
      top="15vh"
      custom-class="locker-dialog"
      :close-on-click-modal="false"
    >
      <div slot="title">
        <div class="text-head-5 text-black-700 font-semibold truncate">
          {{ $t('common.takeover') }}
        </div>
      </div>
      <div class="text-left">
        <div class="text-left">
          <div class="form-group !mb-4">
            <label for="">Nhập Master Password</label>
            <div class="input-group mb-1.5">
              <input
                v-model="masterPassword"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                :name="randomString()"
                autocomplete="new-password"
              >
              <div class="input-group-append !bg-white">
                <button
                  class="btn btn-icon"
                  type="button"
                  tabindex="-1"
                  @click="showPassword = !showPassword"
                >
                  <i
                    class="far"
                    :class="{'fa-eye': !showPassword, 'fa-eye-slash': showPassword}"
                  />
                </button>
              </div>
            </div>
            <PasswordStrengthBar
              v-if="masterPassword"
              :score="passwordStrength.score"
            />
          </div>
          <div class="form-group !mb-4">
            <label for="">Xác nhận Master Password</label>
            <div
              class="input-group"
              :class="[errors.masterRePassword ? 'is-invalid' :'']"
            >
              <input
                v-model="masterRePassword"
                :type="showRePassword ? 'text' : 'password'"
                class="form-control"
                name="repassword"
                placeholder=""
              >
              <div class="input-group-append !bg-white">
                <button
                  class="btn btn-icon"
                  tabindex="-1"
                  @click="showRePassword = !showRePassword"
                >
                  <i
                    class="far"
                    :class="{'fa-eye': !showRePassword, 'fa-eye-slash': showRePassword}"
                  />
                </button>
              </div>
            </div>
            <div class="invalid-feedback">{{ $t('errors.confirm_password') }}</div>
          </div>
        </div>
      </div>
      <div
        slot="footer"
        class="dialog-footer flex items-center text-left"
      >
        <div class="flex-grow" />
        <div>
          <button
            class="btn btn-default"
            @click="dialogConfirmVisible = false"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            class="btn btn-primary"
            :disabled="loadingSetPassword"
            @click="setPasswordForGrantor()"
          >
            {{ $t('common.confirm') }}
          </button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { SymmetricCryptoKey } from 'jslib-common/models/domain/symmetricCryptoKey'
import EmergencyContact from '../../../components/setting/EmergencyContact.vue'
import { Utils } from "jslib-common/misc/utils";
import PasswordStrengthBar from '../../../components/password/PasswordStrengthBar'
export default {
  components: {
    EmergencyContact,
    PasswordStrengthBar
  },
  data () {
    return {
      list_trusted: [],
      list_granted: [],
      loading: true,
      loading2: true,
      loadingConfirm: false,
      dialogConfirmVisible: false,
      dialogRequestVisible: false,
      dialogTakeoverVisible: false,
      dontAskAgain: false,
      publicKey: null,
      userFingerPrint: '',
      selectedEmergencyAccess: {},
      masterPassword: '',
      masterRePassword: '',
      errors: {
      },
      showPassword: false,
      showRePassword: false,
      loadingSetPassword: false
    }
  },
  computed: {
    passwordStrength () {
      return this.$passwordGenerationService.passwordStrength(this.masterPassword, ['cystack']) || {}
    }
  },
  watch: {
    masterRePassword (newValue) {
      if (this.masterPassword && newValue && this.masterPassword !== newValue) {
        this.errors.masterRePassword = 1
      } else {
        this.errors.masterRePassword = 0
      }
    }
  },
  mounted () {
    this.getListTrusted()
    this.getListGranted()
  },
  methods: {
    getEmergencyAccess () {
      this.getListTrusted()
      this.getListGranted()
    },
    postEmergencyAccess () {
      this.$refs.emergencyContact.openDialog({})
    },
    getListTrusted () {
      this.loading = true
      this.axios.get('cystack_platform/pm/emergency_access/trusted')
        .then(res => {
          this.list_trusted = res
          this.loading = false
        })
    },
    getListGranted () {
      this.loading2 = true
      this.axios.get('cystack_platform/pm/emergency_access/granted')
        .then(res => {
          this.list_granted = res
          this.loading2 = false
        })
    },
    putEmergencyAccess (emergency_contact) {
      this.$refs.emergencyContact.openDialog(emergency_contact)
    },
    deleteEmergencyAccess (emergency_contact) {
      this.$refs.emergencyContact.deleteEmergencyAccess(emergency_contact)
    },
    async generateAccessKey () {
      const pk = Utils.fromB64ToArray(this.publicKey)
      const encKey = await this.$cryptoService.getEncKey()
      const key = await this.$cryptoService.rsaEncrypt(encKey.key, pk.buffer)
      return key.encryptedString
    },
    async getPublicKey (emergency_access) {
      this.userFingerPrint = ''
      const { public_key: publicKey } = await this.axios.get(`cystack_platform/pm/emergency_access/${emergency_access.id}/public_key`)
      return publicKey
    },
    async promptConfirmEmergencyAccess (emergency_access) {
      this.selectedEmergencyAccess = emergency_access
      this.publicKey = await this.getPublicKey(emergency_access)
      const publicKey = Utils.fromB64ToArray(this.publicKey)
      const fingerprint = await this.$cryptoService.getFingerprint(emergency_access.grantee_pwd_user_id, publicKey.buffer)
      if (fingerprint) {
        this.userFingerPrint = fingerprint.join('-')
      }
      this.dontAskAgain = await this.$storageService.get('autoConfirmFingerprints')
      this.openDialogConfirm()
    },
    openDialogConfirm () {
      this.dialogConfirmVisible = true
    },
    closeDialogConfirm () {
      this.dialogConfirmVisible = false
    },
    async confirmEmergencyAccess (emergency_access) {
      try {
        this.loadingConfirm = true
        const key = await this.generateAccessKey()
        await this.axios.post(`cystack_platform/pm/emergency_access/${emergency_access.id}/confirm`, {
          key
        })
        this.closeDialogConfirm()
        this.getListTrusted()
        this.notify(this.$t('data.notifications.confirm_emergency_access_success', { user: emergency_access.email }), 'success')
      } catch (e) {
        console.log(e)
        this.notify(this.$t('data.notifications.confirm_emergency_access_failed', { user: emergency_access.email }), 'warning')
      } finally {
        this.loadingConfirm = false
      }
    },
    promptRequestAccess (emergency_access) {
      this.selectedEmergencyAccess = emergency_access
      this.openDialogRequest()
    },
    openDialogRequest (emergency_access) {
      this.dialogConfirmVisible = true
    },
    closeDialogRequest () {
      this.dialogConfirmVisible = false
    },
    async requestAccess (emergency_access) {
      try {
        await this.axios.post(`cystack_platform/pm/emergency_access/${emergency_access.id}/initiate`)
        this.closeDialogRequest()
        this.getListGranted()
        this.notify(this.$t('data.notifications.request_send_success', { user: emergency_access.email }), 'success')
      } catch (e) {
        console.log(e)
        this.notify(this.$t('data.notifications.request_send_failed'), 'warning')
      }
    },
    async approveEmergencyAccess (emergency_access) {
      try {
        await this.axios.post(`cystack_platform/pm/emergency_access/${emergency_access.id}/approve`)
        this.getListTrusted()
        this.notify(this.$t('data.notifications.emergency_access_approved_success'), 'success')
      } catch (e) {
        this.notify(this.$t('data.notifications.emergency_access_approved_failed'), 'warning')
      }
    },
    async rejectEmergencyAccess (emergency_access) {
      try {
        await this.axios.post(`cystack_platform/pm/emergency_access/${emergency_access.id}/reject`)
        this.getListTrusted()
        this.notify(this.$t('data.notifications.emergency_access_rejected_success'), 'success')
      } catch (e) {
        this.notify(this.$t('data.notifications.emergency_access_rejected_failed'), 'warning')
      }
    },
    async acceptInvite (emergency_access) {
      try {
        await this.axios.post(`cystack_platform/pm/emergency_access/${emergency_access.id}/accept`)
        this.getListGranted()
        this.notify(this.$t('data.notifications.accept_invitation_success'), 'success')
      } catch (e) {
        this.notify(this.$t('data.notifications.accept_invitation_failed'), 'warning')
      }
    },
    async reinvite (emergency_access) {
      try {
        await this.axios.post(`cystack_platform/pm/emergency_access/${emergency_access.id}/reinvite`)
        this.getListTrusted()
        this.notify(this.$t('data.notifications.reinvited_user_success', { user: emergency_access.email }), 'success')
      } catch (e) {
        this.notify(this.$t('data.notifications.reinvited_user_failed', { user: emergency_access.email }), 'warning')
      }
    },
    viewGrantorVault (item) {
      this.$router.push({
        name: 'settings-emergency-access-id',
        params: { id: item.id }
      })
    },
    takeoverGrantorVault (item) {
      this.dialogTakeoverVisible = true
      this.selectedEmergencyAccess = item
    },
    async setPasswordForGrantor () {
      try {
        this.loadingSetPassword = true
        const response = await this.axios.post(`/cystack_platform/pm/emergency_access/${this.selectedEmergencyAccess.id}/takeover`)
        const oldKeyBuffer = await this.$cryptoService.rsaDecrypt(response.key_encrypted)
        const oldEncKey = new SymmetricCryptoKey(oldKeyBuffer)
        if (oldEncKey == null) {
          this.notify(this.$t('data.notifications.error_occurred'), 'warning')
          return
        }

        const key = await this.$cryptoService.makeKey(this.masterPassword, this.selectedEmergencyAccess.email, response.kdf, response.kdf_iterations)
        const masterPasswordHash = await this.$cryptoService.hashPassword(this.masterPassword, key)

        const encKey = await this.$cryptoService.remakeEncKey(key, oldEncKey)
        const request = {
          key: encKey[1].encryptedString,
          new_master_password_hash: masterPasswordHash
        }
        await this.axios.post(`/cystack_platform/pm/emergency_access/${this.selectedEmergencyAccess.id}/password`, request)
        this.notify(this.$t('data.notifications.takeover_success', { user: this.selectedEmergencyAccess.email }), 'success')
        this.dialogTakeoverVisible = false
      } catch (error) {
        this.notify(this.$t('data.notifications.error_occurred'), 'warning')
      } finally {
        this.loadingSetPassword = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
