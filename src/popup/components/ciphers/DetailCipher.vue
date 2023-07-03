<template>
  <div>
    <div
      class="uppercase mb-2"
    >
      {{$t('common.item_info')}}
    </div>
    <div
      class="cipher-item"
    >
      <div
        class="cipher-field"
      >
        <div class="">{{$t('common.item_name')}}</div>
        <div class="font-semibold">{{cipher.name}}</div>
      </div>
      <template v-if="cipher.type === CipherType.Login">
        <TextHaveCopy
          label="Email / Username"
          :text="cipher.login.username"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.password')"
          :text="cipher.login.password"
          :view-password="cipher.viewPassword"
          should-hide
        />
        <div
          class="grid md:grid-cols-6 cipher-field"
          style=""
        >
          <div class="">{{ $t('data.ciphers.password_security') }}</div>
          <div class="col-span-4 font-semibold">
            <PasswordStrength :score="passwordStrength.score" />
          </div>
        </div>
        <div
          v-for="(item, index) in cipher.login.uris"
          v-show="item.uri"
          :key="index"
          class="grid md:grid-cols-6 cipher-field"
          style=""
        >
          <div class="">{{ $t('data.ciphers.website_address') }}</div>
          <div class="flex justify-between">
            <div
              class="col-span-4 font-semibold truncate"
              style="width: 300px;"
              :title="item.uri"
            >
              {{ item.uri }}
            </div>
            <div class="text-right">
              <button
                v-if="item.canLaunch"
                class="btn btn-icon btn-xs btn-action"
                @click="openNewTab(item.uri)"
              >
                <i class="fas fa-external-link-square-alt" />
              </button>
            </div>
          </div>
        </div>
        <TextHaveCopy
          :label="$t('data.ciphers.notes')"
          :text="cipher.notes"
          :text-area="true"
        />
      </template>
      <template v-if="cipher.type === CipherType.SecureNote">
        <TextHaveCopy
          :label="$t('data.ciphers.notes')"
          :text="cipher.notes"
          :text-area="true"
        />
      </template>
      <template v-if="cipher.type === CipherType.Card">
        <TextHaveCopy
          :label="$t('data.ciphers.card_holder')"
          :text="cipher.card.cardholderName"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.brand')"
          :text="cipher.card.brand"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.card_number')"
          :text="cipher.card.number"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.expiration_month')"
          :text="cipher.card.expMonth"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.expiration_year')"
          :text="cipher.card.expYear"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.cvv')"
          :text="cipher.card.code"
          should-hide
        />
        <TextHaveCopy
          :label="$t('data.ciphers.notes')"
          :text="cipher.notes"
          :text-area="true"
        />
      </template>
      <template v-if="cipher.type === CipherType.Identity">
        <TextHaveCopy
          :label="$t('data.ciphers.title')"
          :text="cipher.identity.title?$t(`common.${cipher.identity.title}`):null"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.first_name')"
          :text="cipher.identity.firstName"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.last_name')"
          :text="cipher.identity.lastName"
        />
        <TextHaveCopy
          label="Username"
          :text="cipher.identity.username"
        />
        <TextHaveCopy
          label="Email"
          :text="cipher.identity.email"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.company')"
          :text="cipher.identity.company"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.ssn')"
          :text="cipher.identity.ssn"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.passport')"
          :text="cipher.identity.passportNumber"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.license')"
          :text="cipher.identity.licenseNumber"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.address') + '1'"
          :text="cipher.identity.address1"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.address') + '2'"
          :text="cipher.identity.address2"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.city_town')"
          :text="cipher.identity.city"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.state_province')"
          :text="cipher.identity.state"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.zip')"
          :text="cipher.identity.postalCode"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.country')"
          :text="cipher.identity.country"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.notes')"
          :text="cipher.notes"
          :text-area="true"
        />
      </template>
      <template v-if="cipher.type === CipherType.CryptoAccount && cipher.cryptoAccount">
        <TextHaveCopy
          label="Email / Username"
          :text="cipher.cryptoAccount.username"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.password')"
          :text="cipher.cryptoAccount.password"
          :view-password="cipher.viewPassword"
          should-hide
        />
        <div class="grid md:grid-cols-6 cipher-item">
          <div class="">{{ $t('data.ciphers.password_security') }}</div>
          <div class="col-span-4 font-semibold">
            <PasswordStrength :score="passwordStrength.score" />
          </div>
        </div>
        <div
          v-if="cipher.cryptoAccount.uris"
          class="grid md:grid-cols-6 cipher-item"
        >
          <div class="">{{ $t('data.ciphers.website_address') }}</div>
          <div class="col-span-4 font-semibold">
            {{ cipher.cryptoAccount.uris.uri }}
          </div>
          <div class="text-right">
            <button
              class="btn btn-icon btn-xs btn-action"
              :title="$t('common.go_to_website')"
              @click="openNewTab(cipher.cryptoAccount.uris.uri)"
            >
              <i class="fas fa-external-link-square-alt" />
            </button>
          </div>
        </div>
        <TextHaveCopy
          :label="$t('data.ciphers.phone')"
          :text="cipher.cryptoAccount.phone"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.recovery_email')"
          :text="cipher.cryptoAccount.emailRecovery"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.notes')"
          :text="cipher.cryptoAccount.notes"
          :text-area="true"
        />
      </template>
      <template v-if="cipher.type === CipherType.CryptoWallet && cipher.cryptoWallet">
        <TextHaveCopy
          label="Email"
          :text="cipher.cryptoWallet.email"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.password')"
          :text="cipher.cryptoWallet.password"
          :view-password="cipher.viewPassword"
          should-hide
        />
        <div
          class="grid md:grid-cols-6 cipher-field"
          style=""
        >
          <div class="">{{ $t('data.ciphers.password_security') }}</div>
          <div v-if="cipher.cryptoWallet.password" class="col-span-4 font-semibold">
            <PasswordStrength :score="passwordStrength.score" />
          </div>
        </div>
        <TextHaveCopy
          :label="$t('data.ciphers.pin')"
          :text="cipher.cryptoWallet.pin"
          :view-password="cipher.viewPassword"
          should-hide
        />
        <TextHaveCopy
          :label="$t('data.ciphers.wallet_address')"
          :text="cipher.cryptoWallet.address"
        />
        <TextHaveCopy
          :label="$t('data.ciphers.private_key')"
          :text="cipher.cryptoWallet.privateKey"
          :view-password="cipher.viewPassword"
          should-hide
        />
        <div
          class="grid md:grid-cols-6 cipher-field"
          style=""
        >
          <div class="mb-1">{{ $t('data.ciphers.seed') }}</div>
          <InputSeedPhrase
            v-if="cipher.cryptoWallet.seed"
            v-model="cipher.cryptoWallet.seed"
            :disabled="true"
            class="w-full"
          />
        </div>
        <div
          class="grid md:grid-cols-6 cipher-field"
          style=""
        >
          <div class="mb-1">{{ $t('data.ciphers.networks') }}</div>
          <div class="flex items-center" style="flex-wrap: wrap;">
            <div
              v-for="item in selectedNetworks"
              :key="item.alias"
              class="flex items-center mr-4"
            >
              <img :src="item.logo" style="width: 24px;" alt="" class="mr-2">
              <b>{{ item.name }}</b>
            </div>
          </div>
        </div>
        <TextHaveCopy
          :label="$t('data.ciphers.notes')"
          :text="cipher.cryptoWallet.notes"
          :text-area="true"
        />
      </template>
      <div>
        <TextHaveCopy
          v-for="(item, index) in cipher.fields"
          :key="index"
          :label="item.name"
          :text="item.value"
        />
      </div>
      <div
        class="grid md:grid-cols-6 cipher-field"
        style=""
      >
        <div class="">{{ $t('data.ciphers.owned_by') }}</div>
        <div class="col-span-4 font-semibold flex items-center">
          <span>{{ getTeam(teams, cipher.organizationId).name || $t('common.me') }}</span>
        </div>
      </div>
      <div
        v-if="(cipher.collectionIds && cipher.collectionIds.length) || cipher.folderId"
        class="grid md:grid-cols-6 cipher-field"
        style=""
      >
        <div class="">{{ $t('data.ciphers.folder') }}</div>
        <div class="col-span-4">
          <template v-if="cipher && cipher.collectionIds && cipher.collectionIds.length">
            <div
              v-for="item in cipher.collectionIds"
              :key="item"
              class="font-semibold flex items-center mt-2"
            >
              <img
                :src="item.id === 'unassigned' ? require('@/assets/images/icons/folderSolid.svg') : require('@/assets/images/icons/folderSolidShare.svg')"
                alt=""
                class="mr-3"
              > {{ findFolder(collections, item).name }}
            </div>
          </template>
          <div
            v-if="cipher && cipher.folderId"
            class="font-semibold flex items-center mt-2"
          >
            <img
              src="@/assets/images/icons/folderSolid.svg"
              alt=""
              class="mr-3"
            > {{ findFolder(folders, cipher.folderId).name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import find from 'lodash/find'
import PasswordStrength from '@/popup/components/password/PasswordStrength'
import { CipherType } from "jslib-common/enums/cipherType";
import TextHaveCopy from '@/popup/components/ciphers/TextHaveCopy';
import InputSeedPhrase from '@/components/input/InputSeedPhrase';

import { CHAIN_LIST } from '@/utils/crypto/chainlist/index'

export default Vue.extend({
  components: {
    TextHaveCopy,
    PasswordStrength,
    InputSeedPhrase,
  },
  props: {
  },
  data () {
    return {
      showPassword: false,
      CipherType
    }
  },
  asyncComputed: {
    ciphers: {
      async get () {
        const deletedFilter = c => {
          return c.isDeleted === false
        }
        const result = await this.$searchService.searchCiphers('', [null, deletedFilter], null) || []
        result.map(item => {
          if (item.type === CipherType.CryptoAccount) {
            try {
              item.cryptoAccount = JSON.parse(item.notes)
            // eslint-disable-next-line no-empty
            } catch (error) {}
          }
          if (item.type === CipherType.CryptoWallet) {
            try {
              item.cryptoWallet = JSON.parse(item.notes)
            // eslint-disable-next-line no-empty
            } catch (error) {}
          }
          return item
        })
        return result
      },
      watch: ['$store.state.syncedCiphersToggle']
    },
    folders: {
      async get () {
        return await this.$folderService.getAllDecrypted() || []
      },
      watch: ['$store.state.syncedCiphersToggle']
    },
    collections: {
      async get () {
        let collections = await this.$collectionService.getAllDecrypted() || []
        collections = collections.filter(f => f.id)
        collections.forEach(f => {
          const ciphers = this.ciphers && (this.ciphers.filter(c => c.collectionIds.includes(f.id)) || [])
          f.ciphersCount = ciphers && ciphers.length
        })
        return collections
      },
      watch: ['$store.state.syncedCiphersToggle', 'ciphers']
    },
  },
  computed: {
    cipher () {
      if (this.ciphers) {
        return find(this.ciphers, e => e.id === this.$route.params.id) || { collectionIds: [] }
      }
      return this.$route.params.data || {}
    },
    passwordStrength () {
      if (this.cipher && this.cipher.login && this.cipher.type == CipherType.Login) {
        return this.$passwordGenerationService.passwordStrength(this.cipher.login.password, ['cystack']) || {}
      }
      if (this.cipher && this.cipher.cryptoAccount && this.cipher.type == CipherType.CryptoAccount) {
        return this.$passwordGenerationService.passwordStrength(this.cipher.cryptoAccount.password, ['cystack']) || {}
      }
      if (this.cipher && this.cipher.cryptoWallet && this.cipher.type == CipherType.CryptoWallet) {
        return this.$passwordGenerationService.passwordStrength(this.cipher.cryptoWallet.password, ['cystack']) || {}
      }
      return {}
    },
    selectedNetworks () {
      if (this.cipher && this.cipher.cryptoWallet && this.cipher.type == CipherType.CryptoWallet) {
        return this.cipher.cryptoWallet.networks.map((network) => CHAIN_LIST.find(n => n.alias === network.alias))
      }
      return []
    },
  },
  methods: {
    findFolder (folders, id) {
      if (folders) {
        return find(folders, e => e.id === id) || { name: this.$t('data.folders.no_folder'), id: 'unassigned' }
      }
      return { name: this.$t('data.folders.no_folder'), id: 'unassigned' }
    }
  }
})
</script>
<style>
.cipher-item .cipher-field {
  @apply mb-2 w-full px-4 py-2 bg-white;
}
</style>
