<template>
  <div>
    <li
      v-if="item.id"
      class="cipher-item"
    >
      <div
        class="text-[32px] mr-3 flex-shrink-0"
        :class="{'filter grayscale': item.isDeleted}"
        @click="fillCipher()"
      >
        <Vnodes :vnodes="getIconCipher(item, 32)" />
      </div>
      <div class="flex-grow overflow-hidden">
        <div
          class="text-black font-semibold truncate hover:text-primary"
          style="line-height: 18px;"
          @click.self="$router.push({ name: 'vault-detail', params: { id: item.id, data: item } })"
        >
          {{ item.name }}
          <img
            v-if="item.organizationId"
            src="@/assets/images/icons/shares.svg"
            alt="Shared"
            :title="$t('common.shared_with_you')"
            class="inline-block ml-2"
          >
        </div>
        <div
          class="truncate text-[#A2A3A7]"
          style="line-height: 16px;"
        >
          <small>
            {{ item.type === CipherType.CryptoWallet && item.cryptoWallet ? item.cryptoWallet.username : item.subTitle }}
          </small>
        </div>
      </div>
      <div>
        <div class="col-actions" style="display: inline-flex">
          <button
            v-if="item.login.canLaunch"
            class="btn btn-icon btn-xs hover:text-primary"
            :title="`Launch ${item.login.uri}`"
            @click="openNewTab(item.login.uri)"
            >
              <i class="fas fa-external-link-square-alt" />
          </button>
          <el-dropdown
            v-if="!item.isDeleted && [CipherType.Login, CipherType.SecureNote, 6, 7].includes(item.type)"
            trigger="click"
            :hide-on-click="false"
          >
            <button class="btn btn-icon btn-xs hover:text-primary">
              <i class="fas fa-clone" />
            </button>
            <el-dropdown-menu slot="dropdown">
              <template v-if="item.type === CipherType.Login">
                <el-dropdown-item
                  v-clipboard:copy="item.login.username"
                  v-clipboard:success="clipboardSuccessHandler"
                >
                  {{ $t('common.copy') }} {{ $t('common.username') }}
                </el-dropdown-item>
                <el-dropdown-item
                  v-clipboard:copy="item.login.password"
                  v-clipboard:success="clipboardSuccessHandler"
                >
                  {{ $t('common.copy') }} {{ $t('common.password') }}
                </el-dropdown-item>
              </template>
              <template v-if="item.type === CipherType.SecureNote">
                <el-dropdown-item
                  v-clipboard:copy="item.notes"
                  v-clipboard:success="clipboardSuccessHandler"
                >
                  {{ $t('common.copy') }} {{ $t('common.note') }}
                </el-dropdown-item>
              </template>
              <template v-if="item.type === CipherType.CryptoAccount && item.cryptoAccount">
                <el-dropdown-item
                  v-clipboard:copy="item.cryptoAccount.username"
                  v-clipboard:success="clipboardSuccessHandler"
                >
                  {{ $t('common.copy') }} {{ $t('common.username') }}
                </el-dropdown-item>
                <el-dropdown-item
                  v-clipboard:copy="item.cryptoAccount.password"
                  v-clipboard:success="clipboardSuccessHandler"
                >
                  {{ $t('common.copy') }} {{ $t('common.password') }}
                </el-dropdown-item>
              </template>
              <template v-if="item.type === CipherType.CryptoWallet && item.cryptoWallet">
                <el-dropdown-item
                  v-clipboard:copy="item.cryptoWallet.seed"
                  v-clipboard:success="clipboardSuccessHandler"
                >
                  {{ $t('common.copy') }} {{ $t('data.ciphers.seed') }}
                </el-dropdown-item>
                <el-dropdown-item
                  v-clipboard:copy="item.cryptoWallet.address"
                  v-clipboard:success="clipboardSuccessHandler"
                >
                  {{ $t('common.copy') }} {{ $t('data.ciphers.wallet_address') }}
                </el-dropdown-item>
                <el-dropdown-item
                  v-clipboard:copy="item.cryptoWallet.privateKey"
                  v-clipboard:success="clipboardSuccessHandler"
                >
                  {{ $t('common.copy') }} {{ $t('data.ciphers.private_key') }}
                </el-dropdown-item>
                <el-dropdown-item
                  v-clipboard:copy="item.cryptoWallet.password"
                  v-clipboard:success="clipboardSuccessHandler"
                >
                  {{ $t('common.copy') }} {{ $t('data.ciphers.password_pin') }}
                </el-dropdown-item>
              </template>
            </el-dropdown-menu>
          </el-dropdown>
          <template v-if="!item.isDeleted && canManageItem(organizations, item)">
            <button
              class="btn btn-icon btn-xs hover:text-primary"
              @click="addEdit(item)"
            >
              <i class="fas fa-pen" />
            </button>
          </template>
        </div>
      </div>
    </li>
  </div>
</template>

<script>
import Vue from 'vue'
import {CipherType} from "jslib-common/enums/cipherType";
import Vnodes from "@/popup/components/Vnodes.vue";
import { CipherView } from 'jslib-common/models/view/cipherView';
export default Vue.extend(
  {
    components: {
      Vnodes
    },
    props: {
      item:{
        type: [CipherView, Object],
        default: () => new CipherView()
      }
    },
    data(){
      return {
        CipherType
      }
    },
    asyncComputed: {
      organizations: {
        async get () {
          const result = await this.$userService.getAllOrganizations()
          return result
        },
        watch: ['$store.state.syncedCiphersToggle']
      }
    },
    methods: {
      addEdit (item) {
        this.$router.push({name: 'add-edit-cipher', params: {data: item}})
      },
      fillCipher(){
        this.$emit('do-fill')
      }
    }
  }
)
</script>

<style lang="scss" scoped>

</style>
