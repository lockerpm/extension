<template>
  <div class="flex flex-col flex-grow relative">
    <div class="flex-grow lg:px-28 py-8 px-10 mb-20">
      <div class="flex items-center justify-between">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <template v-if="$route.name === 'vault-folders-folderId-id'">
            <el-breadcrumb-item
              :to="{name: 'vault'}"
            >
              {{ $t('sidebar.vault') }}
            </el-breadcrumb-item>
            <el-breadcrumb-item
              class="flex items-center"
              :to="{name: 'vault-folders-folderId', params: $route.params}"
            >
              {{ folder.name }}
            </el-breadcrumb-item>
          </template>
          <template v-else-if="$route.name === 'vault-teams-teamId-tfolders-tfolderId-id'">
            <el-breadcrumb-item
              :to="{name: 'vault'}"
            >
              {{ $t('sidebar.vault') }}
            </el-breadcrumb-item>
            <el-breadcrumb-item
              class="flex items-center"
              :to="{name: 'vault-teams-teamId-tfolders-tfolderId', params: $route.params}"
            >
              {{ getTeam(teams, $route.params.teamId).name }} - {{ collection.name }}
            </el-breadcrumb-item>
          </template>
          <template v-else>
            <el-breadcrumb-item
              :to="{name: routeName}"
            >
              {{ $t(`sidebar.${routeName}`) }}
            </el-breadcrumb-item>
          </template>
          <el-breadcrumb-item>
            {{ cipher.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>
        <div v-if="canManageItem(teams, cipher)" class="header-actions">
          <button
            class="btn btn-icon btn-xs btn-action"
            @click="addEdit"
          >
            <i class="fa fa-pen" />
          </button>
          <button
            v-if="!cipher.organizationId"
            class="btn btn-icon btn-xs btn-action"
            @click="shareItem(cipher)"
          >
            <i class="fas fa-share-square" />
          </button>
          <el-dropdown trigger="click" :hide-on-click="false">
            <button class="btn btn-icon btn-xs btn-action">
              <i class="fas fa-ellipsis-h" />
            </button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="moveFolders([cipher.id])">
                {{ $t('common.move_folder') }}
              </el-dropdown-item>
              <el-dropdown-item @click.native="deleteCiphers([cipher.id])">
                <span class="text-danger">{{ $t('common.delete') }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <client-only>
        <div class="mt-20 mb-9 text-center">
          <div class="mb-4 text-[70px]">
            <Vnodes :vnodes="getIconCipher(cipher, 34)" />
          </div>
          <div class="text-head-4 font-medium">
            {{ cipher.name }}
          </div>
        </div>
        <div v-show="!editMode" class="cipher-items">
          <template v-if="cipher.type === CipherType.Login">
            <TextHaveCopy label="Email / Username" :text="cipher.login.username" />
            <TextHaveCopy
              :label="$t('data.ciphers.password')"
              :text="cipher.login.password"
              should-hide
            />
            <div class="grid md:grid-cols-6 cipher-item">
              <div class="">{{ $t('data.ciphers.password_security') }}</div>
              <div class="col-span-4 font-semibold">
                <PasswordStrength :score="passwordStrength.score" />
              </div>
            </div>
            <div
              v-for="(item, index) in cipher.login.uris"
              v-show="item.uri"
              :key="index"
              class="grid md:grid-cols-6 cipher-item"
            >
              <div class="">{{ $t('data.ciphers.website_address') }}</div>
              <div class="col-span-4 font-semibold">
                {{ item.uri }}
              </div>
              <div class="text-right">
                <button v-if="item.canLaunch" class="btn btn-icon btn-xs btn-action" @click="openNewTab(item.uri)">
                  <i class="fas fa-external-link-square-alt" />
                </button>
              </div>
            </div>
          </template>
          <template v-if="cipher.type === CipherType.Card">
            <TextHaveCopy :label="$t('data.ciphers.card_holder')" :text="cipher.card.cardholderName" />
            <TextHaveCopy :label="$t('data.ciphers.brand')" :text="cipher.card.brand" />
            <TextHaveCopy :label="$t('data.ciphers.card_number')" :text="cipher.card.number" />
            <TextHaveCopy :label="$t('data.ciphers.expiration_month')" :text="cipher.card.expMonth" />
            <TextHaveCopy :label="$t('data.ciphers.expiration_year')" :text="cipher.card.expYear" />
            <TextHaveCopy :label="$t('data.ciphers.cvv')" :text="cipher.card.code" should-hide />
          </template>
          <template v-if="cipher.type === CipherType.Identity">
            <TextHaveCopy :label="$t('data.ciphers.title')" :text="cipher.identity.title" />
            <TextHaveCopy :label="$t('data.ciphers.first_name')" :text="cipher.identity.firstName" />
            <TextHaveCopy :label="$t('data.ciphers.last_name')" :text="cipher.identity.lastName" />
            <TextHaveCopy label="Username" :text="cipher.identity.username" />
            <TextHaveCopy label="Email" :text="cipher.identity.email" />
            <TextHaveCopy :label="$t('data.ciphers.company')" :text="cipher.identity.company" />
            <TextHaveCopy :label="$t('data.ciphers.ssn')" :text="cipher.identity.ssn" />
            <TextHaveCopy :label="$t('data.ciphers.passport')" :text="cipher.identity.passportNumber" />
            <TextHaveCopy :label="$t('data.ciphers.license')" :text="cipher.identity.licenseNumber" />
            <TextHaveCopy :label="$t('data.ciphers.address') + '1'" :text="cipher.identity.address1" />
            <TextHaveCopy :label="$t('data.ciphers.address') + '2'" :text="cipher.identity.address2" />
            <TextHaveCopy :label="$t('data.ciphers.city_town')" :text="cipher.identity.city" />
            <TextHaveCopy :label="$t('data.ciphers.state_province')" :text="cipher.identity.state" />
            <TextHaveCopy :label="$t('data.ciphers.zip')" :text="cipher.identity.postalCode" />
            <TextHaveCopy :label="$t('data.ciphers.country')" :text="cipher.identity.country" />
          </template>
          <TextHaveCopy :label="$t('data.ciphers.notes')" :text="cipher.notes" />
          <div class="grid md:grid-cols-6 cipher-item">
            <div class="">{{ $t('data.ciphers.owned_by') }}</div>
            <div class="col-span-4 font-semibold flex items-center">
              <span>{{ getTeam(teams, cipher.organizationId).name || $t('common.me') }}</span>
            </div>
          </div>
          <div class="grid md:grid-cols-6 cipher-item">
            <div class="">{{ $t('data.ciphers.folder') }}</div>
            <div v-if="cipher.organizationId" class="col-span-4 font-semibold flex items-center">
              <img :src="collection.id === 'unassigned' ? require('~/assets/images/icons/folderSolid.svg') : require('~/assets/images/icons/folderSolidShare.svg')" alt="" class="mr-3"> {{ collection.name }}
            </div>
            <div v-else class="col-span-4 font-semibold flex items-center">
              <img src="~/assets/images/icons/folderSolid.svg" alt="" class="mr-3"> {{ folder.name || $t('data.folders.no_folder') }}
            </div>
          </div>
        </div>
      </client-only>
      <ShareCipher ref="shareCipher" />
      <MoveFolder ref="moveFolder" />
      <AddEditCipher ref="addEditCipherDialog" />
      <div class="max-w-[585px] mx-auto">
        <AddEditCipher
          ref="addEditCipherDialog"
          @close="editMode=false"
        />
      </div>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import find from 'lodash/find'
import AddEditCipher from '../../components/cipher/AddEditCipher'
import PasswordStrength from '../password/PasswordStrength'
import { CipherType } from '../../jslib/src/enums'
import TextHaveCopy from '../../components/cipher/TextHaveCopy'
import Vnodes from '../../components/Vnodes'
import ShareCipher from '../../components/cipher/ShareCipher'
import MoveFolder from '../folder/MoveFolder'
export default {
  components: {
    TextHaveCopy,
    AddEditCipher,
    PasswordStrength,
    Vnodes,
    ShareCipher,
    MoveFolder
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
  created () {
  },
  mounted () {
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
    addEdit () {
      this.editMode = true
      this.$refs.addEditCipherDialog.openDialog(this.cipher, false, true)
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
    async getCipher () {
      // this.folders = await this.getFolders()
      // this.$axios.$get(`cystack_platform/pm/ciphers/${this.$route.params.id}`)
      //   .then(async res => {
      //     res = new CipherResponse(res)
      //     const cipher = new Cipher(res, false)
      //     this.cipher = await cipher.decrypt()
      //     if (this.cipher.type === CipherType.Login) {
      //       this.passwordStrength = this.$passwordGenerationService.passwordStrength(this.cipher.login.password, ['cystack']) || {}
      //     }
      //   })
      //   .catch(e => {
      //     console.log(e)
      //     // this.$router.push({ name: 'passwords' })
      //   })
    },
    checkPassword: debounce(function (password) {
      return this.$passwordGenerationService.passwordStrength(String(password), ['cystack']) || {}
    }, 600)
  }
}
</script>
