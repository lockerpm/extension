<template>
  <div>
    <NoCipher
      v-if="shouldRenderNoCipher"
      :type="type"
      @add-cipher="handleAddButton"
    />
    <AddEditCipher ref="addEditCipherDialog" :type="type" />
  </div>
</template>

<script>

import Vue from 'vue'
import find from 'lodash/find'
import cloneDeep from 'lodash/cloneDeep'
import groupBy from 'lodash/groupBy'
import orderBy from 'lodash/orderBy'
import { CipherType } from "jslib-common/enums/cipherType";
import NoCipher from "@/components/cipher/NoCipher";
import AddEditCipher from "@/components/cipher/AddEditCipher";

export default Vue.extend({
  components: {
    NoCipher,
    AddEditCipher
  },
  data () {
    return {
      cryptoService: null,
      data: {},
      CipherType,
      multipleSelection: [],
      loading: false,
      orderField: 'name', // revisionDate
      orderDirection: 'asc',
      selectedFolder: {},
      context: '',
      publicKey: ''
    }
  },
  props: {
    deleted: {
      type: Boolean,
      default: false
    },
    routeName: {
      type: String,
      default: 'passwords'
    },
    filter: {
      type: Function,
      default: null
    }
  },
  computed: {
    folder () {
      if (this.folders) {
        return find(this.folders, e => e.id === this.$route.params.folderId) || {}
      }
      return {}
    },
    collection () {
      if (this.collections) {
        return find(this.collections, e => e.id === this.$route.params.tfolderId) || { name: 'Unassigned Folder' }
      }
      return {}
    },
    filteredCollection () {
      return groupBy(this.collections, 'organizationId')
    },
    orderString () {
      return `${this.orderField}_${this.orderDirection}`
    },
    type () {
      switch (this.routeName) {
      case 'passwords':
        return 'Login'
      case 'notes':
        return 'SecureNote'
      case 'cards':
        return 'Card'
      case 'identities':
        return 'Identity'
      case 'vault':
        return 'Vault'
      case 'shares':
        return 'Shares'
      case 'trash':
        return 'Trash'
      default:
        return null
      }
    },
    filteredCiphers () {
      if (this.$route.name === 'vault' && this.ciphers) {
        return this.ciphers.filter(e => !e.folderId)
      }
      return this.ciphers || []
    },
    shouldRenderNoCipher () {
      const haveCipher = this.filteredCiphers.length
      if (this.$route.name === 'vault') {
        return this.folders && !this.folders.length && !haveCipher
      }
      if (this.$route.name === 'shares') {
        return this.collections && !this.collections.length
      }
      if (this.$route.name === 'vault-folders-folderId') {
        return false
      }
      if (this.$route.name === 'vault-tfolders-tfolderId') {
        return false
      }
      return !haveCipher && !this.searchText
      // return true
    },
    shouldRenderShare () {
      return (this.$route.name === 'shares')
    },
    canManageTeamFolder () {
      return this.teams.some(e => ['owner', 'admin'].includes(e.role))
    },
    toggleE () {
      return this.$store.state.syncedCiphersToggle
    }
  },
  asyncComputed: {
    ciphers: {
      async get () {
        try {
          const deletedFilter = c => {
            return c.isDeleted === this.deleted
          }
          const result = await this.$searchService.searchCiphers(this.searchText, [this.filter, deletedFilter], null) || []
          console.log(result)
          return orderBy(result, [c => this.orderField === 'name' ? (c.name && c.name.toLowerCase()) : c.revisionDate], [this.orderDirection]) || []
        } catch (e) {
          return []
        }
      },
      watch: ['$store.state.syncedCiphersToggle', 'deleted', 'searchText', 'filter', 'orderField', 'orderDirection']
    },
    folders: {
      async get () {
        try {
          let folders = await this.$folderService.getAllDecrypted() || []
          folders = folders.filter(f => f.id)
          folders.forEach(f => {
            const ciphers = this.ciphers && (this.ciphers.filter(c => c.folderId === f.id) || [])
            f.ciphersCount = ciphers && ciphers.length
          })
          return folders
        } catch (e) {
          return []
        }
      },
      watch: ['searchText', 'orderField', 'orderDirection', 'ciphers']
    },
    collections: {
      async get () {
        try {
          let collections = await this.$collectionService.getAllDecrypted() || []
          collections = collections.filter(f => f.id)
          collections.forEach(f => {
            const ciphers = this.ciphers && (this.ciphers.filter(c => c.collectionIds.includes(f.id)) || [])
            f.ciphersCount = ciphers && ciphers.length
          })
          return collections
        } catch (e) {
          return  []
        }
      },
      watch: ['searchText', 'orderField', 'orderDirection', 'ciphers']
    },
    weakPasswordScores: {
      async get () {
        const weakPasswordScores = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }
        if (this.$route.name === 'vault') {
          const allCiphers = await this.$cipherService.getAllDecrypted()
          const isUserNameNotEmpty = c => {
            return c.login.username != null && c.login.username.trim() !== ''
          }
          allCiphers.forEach(c => {
            if (c.type !== CipherType.Login || c.login.password == null || c.login.password === '' || c.isDeleted || c.organizationId) {
              return
            }
            const hasUserName = isUserNameNotEmpty(c)
            let userInput = []
            if (hasUserName) {
              const atPosition = c.login.username.indexOf('@')
              if (atPosition > -1) {
                userInput = userInput.concat(
                  c.login.username.substr(0, atPosition).trim().toLowerCase().split(/[^A-Za-z0-9]/))
                  .filter(i => i.length >= 3)
              } else {
                userInput = c.login.username.trim().toLowerCase().split(/[^A-Za-z0-9]/)
                  .filter(i => i.length >= 3)
              }
            }
            const result = this.$passwordGenerationService.passwordStrength(c.login.password,
              userInput.length > 0 ? userInput : null)
            weakPasswordScores[result.score]++
          })
          await this.axios.put('/cystack_platform/pm/users/me', {
            scores: weakPasswordScores
          })
        }
        return weakPasswordScores
      },
      watch: ['$store.state.syncedCiphersToggle']
    }
  },
  mounted() {
    console.log(1)
    console.log(process.env.NODE_ENV)
  },
  methods: {
    async getCiphers () {
      const deletedFilter = c => {
        return c.isDeleted === this.deleted
      }
      const ciphers = await this.$searchService.searchCiphers(this.searchText, [this.filter, deletedFilter], null)
      const ciphersSS = await this.$cipherService.getAllDecrypted()
    },
    addEdit (cipher) {
      this.$refs.addEditCipherDialog.openDialog(cloneDeep(cipher))
    },
    handleAddButton () {
      this.addEdit({})
    }
  }
})
</script>
