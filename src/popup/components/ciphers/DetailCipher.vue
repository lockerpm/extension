<template>
  <div
    class="flex flex-col flex-grow relative"
    style="background: #F1F1F1; padding-top: 44px"
  >
    <div
      class="flex items-center cursor-pointer h-[44px] leading-[44px] px-5 justify-between fixed top-0 left-0 right-0 bg-white"
      style="z-index: 1"
    >
      <div
        class="menu-icon mr-4"
        @click="$router.back()"
      >
        <i class="fas fa-chevron-left text-[20px]"></i> Back
      </div>
      <div>View item</div>
      <div
        v-if="canManageItem(teams, cipher)"
        @click="addEdit(cipher)"
      >
        Edit
      </div>
    </div>
    <div
      class="uppercase px-3 mt-4 mb-1"
      style="padding-left: 20px"
    >Item information</div>
    <div
      v-show="!editMode"
      class="cipher-item"
    >
      <div
        class="cipher-field"
        style=""
      >
        <div class="">Name</div>
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
        <!-- {{passwordStrength}} -->
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
            <div class="col-span-4 font-semibold">
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
      </template>
      <template v-if="cipher.type === CipherType.Identity">
        <TextHaveCopy
          :label="$t('data.ciphers.title')"
          :text="cipher.identity.title"
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
      </template>
      <TextHaveCopy
        :label="$t('data.ciphers.notes')"
        :text="cipher.notes"
      />
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
        class="grid md:grid-cols-6 cipher-field"
        style=""
        v-if="(cipher.collectionIds && cipher.collectionIds.length) || cipher.folderId"
      >
        <div class="">{{ $t('data.ciphers.folder') }}</div>
        <div class="col-span-4">
          <template v-if="cipher.collectionIds && cipher.collectionIds.length">
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
            v-if="cipher.folderId"
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
import debounce from 'lodash/debounce'
import find from 'lodash/find'
import AddEditCipher from '@/components/cipher/AddEditCipher'
import PasswordStrength from '@/components/password/PasswordStrength'
import { CipherType } from "jslib-common/enums/cipherType";
import TextHaveCopy from '@/popup/components/ciphers/TextHaveCopy'
import Vnodes from '@/components/Vnodes'
import ShareCipher from '@/components/cipher/ShareCipher'
import MoveFolder from '@/components/folder/MoveFolder'
export default Vue.extend({
  components: {
    TextHaveCopy,
    PasswordStrength
  },
  props: {
    type: {
      type: String,
      default: ''
    },
    routeName: {
      type: String,
      default: 'passwords'
    }
  },
  data () {
    return {
      // cipher: {},
      showPassword: false,
      CipherType,
      editMode: false
    }
  },
  computed: {
    folder () {
      return find(this.folders, e => e.id === this.cipher.folderId) || {}
    },
    collection () {
      if (this.collections) {
        return find(this.collections, e => e.id === this.$route.params.tfolderId) || { name: 'Unassigned Folder', id: 'unassigned' }
      }
      return {}
    },
    cipher () {
      return find(this.ciphers, e => e.id === this.$route.params.id) || { collectionIds: [] }
    },
    passwordStrength () {
      if (this.cipher.login) {
        return this.$passwordGenerationService.passwordStrength(this.cipher.login.password, ['cystack']) || {}
      }
      return {}
    }
  },
  asyncComputed: {
    ciphers: {
      async get () {
        const deletedFilter = c => {
          return c.isDeleted === false
        }
        return await this.$searchService.searchCiphers('', [null, deletedFilter], null) || []
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
    }
  },
  methods: {
    addEdit (item) {
      // this.$platformUtilsService.launchUri(`/web.html#/vault/${item.id}`)
      this.$router.push({ name: 'add-item-create', params: { data: item } })
    },
    shareItem (cipher) {
      this.$refs.shareCipher.openDialog(cipher)
    },
    moveFolders (ids) {
      this.$refs.moveFolder.openDialog(ids)
    },
    deleteCiphers (ids) {
      this.$refs.addEditCipherDialog.deleteCiphers(ids)
    },
    checkPassword: debounce(function (password) {
      return this.$passwordGenerationService.passwordStrength(String(password), ['cystack']) || {}
    }, 600),
    findCollection (collections, id) {
      return find(collections, e => e.id === id) || { name: 'Unassigned Folder', id: 'unassigned' }
    },
    findFolder (folders, id) {
      return find(folders, e => e.id === id) || { name: this.$t('data.folders.no_folder'), id: 'unassigned' }
    }
  }
})
</script>
<style>
.cipher-item .cipher-field {
  @apply mb-2 w-full px-5 py-2 bg-white;
}
</style>
