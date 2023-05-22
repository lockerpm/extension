<template>
  <div class="flex flex-col flex-column-fluid relative">
    <div class="flex-column-fluid py-10 mb-20">
      <client-only>
        <!-- <div
          class="mb font-medium"
        >
          Vault
        </div> -->
        <div class="mb-5">
          <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item
              :to="{name: 'settings-emergency-access'}"
            >
              {{ $t('data.emergency_access.emergency_access') }}
            </el-breadcrumb-item>
            <el-breadcrumb-item>
              Vault
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <el-table
          ref="multipleTable"
          :data="ciphers || []"
          style="width: 100%"
          row-class-name="hover-table-row"
        >
          <el-table-column
            prop="name"
            label=""
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <div class="flex items-center">
                <div
                  class="text-[34px] mr-3 flex-shrink-0"
                >
                  <Vnodes :vnodes="getIconCipher(scope.row, 34)" />
                </div>
                <div class="flex flex-col">
                  <a
                    class="text-black font-semibold truncate flex items-center"
                    @click="addEdit(scope.row)"
                  >
                    {{ scope.row.name }}
                  </a>
                  <div>
                    {{ scope.row.subTitle }}
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label=""
            align="right"
            width="200"
          >
            <template slot-scope="scope">
              <div class="col-actions">
                <button
                  v-if="scope.row.login.canLaunch"
                  class="btn btn-icon btn-xs hover:bg-black-400"
                  :title="$t('common.go_to_website')"
                  @click="openNewTab(scope.row.login.uri)"
                >
                  <i class="fas fa-external-link-square-alt" />
                </button>
                <el-dropdown trigger="click" :hide-on-click="false">
                  <button class="btn btn-icon btn-xs hover:bg-black-400">
                    <i class="fas fa-ellipsis-h" />
                  </button>
                  <el-dropdown-menu slot="dropdown">
                    <template v-if="!scope.row.isDeleted && scope.row.type === CipherType.Login">
                      <el-dropdown-item
                        v-clipboard:copy="scope.row.login.username"
                        v-clipboard:success="clipboardSuccessHandler"
                        divided
                      >
                        {{ $t('common.copy') }} {{ $t('common.username') }}
                      </el-dropdown-item>
                      <el-dropdown-item
                        v-clipboard:copy="scope.row.login.password"
                        v-clipboard:success="clipboardSuccessHandler"
                      >
                        {{ $t('common.copy') }} {{ $t('common.password') }}
                      </el-dropdown-item>
                    </template>
                    <template v-if="!scope.row.isDeleted && scope.row.type === CipherType.SecureNote">
                      <el-dropdown-item
                        v-clipboard:copy="scope.row.notes"
                        v-clipboard:success="clipboardSuccessHandler"
                        divided
                      >
                        {{ $t('common.copy') }} {{ $t('common.note') }}
                      </el-dropdown-item>
                    </template>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </client-only>
    </div>
    <ViewGrantorCipher ref="addEditCipherDialog" :type="type" />
  </div>
</template>

<script>
import { SymmetricCryptoKey } from 'jslib-common/models/domain/symmetricCryptoKey'
import { CipherData } from 'jslib-common/models/data/cipherData'
import { Cipher } from 'jslib-common/models/domain/cipher'
import cloneDeep from 'lodash/cloneDeep'
import { CipherType } from 'jslib-common/enums/cipherType'
import Vnodes from '../../../components/Vnodes'
import ViewGrantorCipher from '../../../components/setting/ViewGrantorCipher'
export default {
  components: {
    Vnodes,
    ViewGrantorCipher
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data () {
    return {
      id: null,
      ciphers: [],
      CipherType
    }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  mounted () {
    if (this.$route.params.id === null) {
      return this.$router.push({name: 'settings-emergency-access'})
    }
    this.id = this.$route.params.id
    this.load()
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async load () {
      try {
        const data = await this.axios.post(`/cystack_platform/pm/emergency_access/${this.id}/view`)
        this.ciphers = await this.getAllCiphers(data)
      // eslint-disable-next-line no-empty
      } catch (error) {}
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getAllCiphers (response) {
      const ciphers = response.ciphers
      const decCiphers = []
      const oldKeyBuffer = await this.$cryptoService.rsaDecrypt(response.key_encrypted)
      const oldEncKey = new SymmetricCryptoKey(oldKeyBuffer)

      const promises = []
      ciphers.forEach(cipherResponse => {
        const cipherData = new CipherData(cipherResponse)
        const cipher = new Cipher(cipherData)
        promises.push(cipher.decrypt(oldEncKey).then(c => decCiphers.push(c)))
      })

      await Promise.all(promises)
      decCiphers.sort(this.$cipherService.getLocaleSortingFunction())

      return decCiphers
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    addEdit (cipher) {
      this.$refs.addEditCipherDialog.openDialog(cloneDeep(cipher))
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
