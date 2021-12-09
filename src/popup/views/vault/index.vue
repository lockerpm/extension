<template>
  <div>
    <!-- <div class="">
      <div
        class="flex items-center bg-black-300 cursor-pointer h-[44px] leading-[44px] px-5"
      >
        <div class="menu-icon mr-4">
          <i class="fas fa-chevron-left text-[20px]"></i>
        </div>
        <div class="flex-grow" @click="$router.back()">
          Back
        </div>
        <el-input
          v-model="searchText"
          placeholder="Search vault"
        >
            <i
              slot="suffix"
              class="el-icon-search el-input__icon text-20 font-weight-700 text-black"
            >
            </i>
          </el-input>
        <div @click="$router.push({ name: 'add-item' })">
          <i class="fas fa-plus-circle text-[20px]"></i>
        </div>
      </div>
    </div> -->
    <!-- {{ciphers.length}} -->
    <ul class="">
      <div class="uppercase px-3 mt-4 mb-1">Types ({{menu.length}})</div>
      <li
        v-for="(item, index) in menu"
        :key="index"
        class="flex items-center hover:bg-black-400 bg-white cursor-pointer h-[44px] leading-[44px] px-5 border-b border-black-400"
        @click="openRoute(item)"
      >
        <div class="menu-icon mr-4" style="padding-top: 4px">
          <i
            class="fas text-[20px]"
            :class="[item.icon]"
          ></i>
        </div>
        <div class="flex-grow">
          {{  item.label  }} ({{ciphersCount[`${item.name}`]}})
        </div>
        <div>
          <i class="fas fa-chevron-right"></i>
        </div>
      </li>
      <template v-if="folders">
        <div class="uppercase px-3 mt-4 mb-1">Folders ({{folders.length}})</div>
        <li
          v-for="item in folders"
          :key="item.id"
          class="flex items-center hover:bg-black-400 bg-white cursor-pointer h-[44px] leading-[44px] px-5 border-b border-black-400"
          @click="routerFolder(item)"
        >
          <div class="menu-icon mr-4">
            <!-- <i class="fas fa-folder text-[20px]"></i> -->
            <img src="@/assets/images/icons/folder.svg" alt="" class="">
          </div>
          <div class="flex-grow">{{ item.name }} ({{ item.ciphersCount }})</div>
          <div>
            <i class="fas fa-chevron-right"></i>
          </div>
        </li>
      </template>
      <template
        v-for="(value, key) in filteredCollection"
        class="flex items-center hover:bg-black-400 bg-white cursor-pointer h-[44px] leading-[44px] px-5"
      >
        <div
          class="uppercase px-3 mt-4 mb-1"
          :key="key"
        >{{ getTeam(teams, key).name }}</div>
        <li
          v-for="item in value"
          :key="item.id"
          class="flex items-center hover:bg-black-400 bg-white cursor-pointer h-[44px] leading-[44px] px-5 border-b border-black-400"
          @click="routerCollection(item)"
        >
          <div class="menu-icon mr-4">
            <!-- <i class="fas fa-folder text-[20px]"></i> -->
            <img src="@/assets/images/icons/folder.svg" alt="" class="">
          </div>
          <div class="flex-grow">{{item.name }} ({{ item.ciphersCount }})</div>
          <div>
            <i class="fas fa-chevron-right"></i>
          </div>
        </li>
      </template>
      <div class="uppercase px-3 mt-4 mb-1">No Folders ({{noFolderCiphers.length}})</div>
      <cipher-row
        v-for="item in noFolderCiphers"
        :key="item.id"
        :item="item"
      >
      </cipher-row>

    </ul>
  </div>
</template>

<script>
import Vue from 'vue'
import orderBy from "lodash/orderBy";
import groupBy from 'lodash/groupBy';
import { BrowserApi } from '@/browser/browserApi';
import { CipherType } from 'jslib-common/enums/cipherType';
import CipherRow from "@/popup/components/ciphers/CipherRow";
export default Vue.extend({
  components: {
    CipherRow
  },
  data () {
    return {
      menu: [
        {
          icon: 'fa-key',
          routeName: 'vault-passwords',
          label: 'Passwords',
          divided: false,
          name: 'passwords'
        },
        {
          icon: 'fa-sticky-note',
          routeName: 'vault-notes',
          label: 'Notes',
          divided: false,
          name: 'notes'
        },
        {
          icon: 'fa-credit-card',
          routeName: 'vault-cards',
          label: 'Cards',
          divided: false,
          name: 'cards'
        },
        {
          icon: 'fa-id-card',
          routeName: 'vault-identities',
          label: 'Identities',
          divided: false,
          name: 'identities'
        }
      ],
      CipherType,
      noFolderCiphers: []
    }
  },
  computed: {
    filteredCollection () {
      return groupBy(this.collections, 'organizationId')
    },
    ciphersCount () {
      const passwords = this.ciphers && (this.ciphers.filter(c => c.type === CipherType.Login) || [])
      const passwordsCount = passwords && passwords.length
      const notes = this.ciphers && (this.ciphers.filter(c => c.type === CipherType.SecureNote) || [])
      const notesCount = notes && notes.length
      const cards = this.ciphers && (this.ciphers.filter(c => c.type === CipherType.Card) || [])
      const cardsCount = cards && cards.length
      const identities = this.ciphers && (this.ciphers.filter(c => c.type === CipherType.Identity) || [])
      const identitiesCount = identities && identities.length
      return {
        passwords: passwordsCount,
        notes: notesCount,
        cards: cardsCount,
        identities: identitiesCount
      }
    }
  },
  asyncComputed: {
    ciphers: {
      async get () {
        const deletedFilter = c => {
          return c.isDeleted === false
        }
        let result = await this.$searchService.searchCiphers(this.searchText, [null, deletedFilter], null) || []
        // remove ciphers generated by authenticator
        result = result.filter(cipher => [CipherType.Login, CipherType.SecureNote, CipherType.Card, CipherType.Identity].includes(cipher.type))
        this.noFolderCiphers = result.filter(c => c.folderId === null)
        return orderBy(result, [c => this.orderField === 'name' ? (c.name && c.name.toLowerCase()) : c.revisionDate], [this.orderDirection]) || []
      },
      watch: ['$store.state.syncedCiphersToggle', 'deleted', 'searchText', 'filter', 'orderField', 'orderDirection']
    },
    folders: {
      async get () {
        let folders = await this.$folderService.getAllDecrypted() || []
        folders = folders.filter(f => f.id)
        folders.forEach(f => {
          const ciphers = this.ciphers && (this.ciphers.filter(c => c.folderId === f.id) || [])
          f.ciphersCount = ciphers && ciphers.length
        })
        return folders
      },
      watch: ['searchText', 'orderField', 'orderDirection', 'ciphers']
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
      watch: ['searchText', 'orderField', 'orderDirection', 'ciphers']
    }
  },
  methods: {
    openRoute (item) {
      if (item.externalUrl) {
        this.$platformUtilsService.launchUri(item.externalUrl)
      } else {
        this.$router.push({ name: item.routeName })
      }
    },
    async test () {
      const test = await BrowserApi.getTabFromCurrentWindow()
      console.log(test)
    },
    routerFolder (item) {
      this.$router.push({
        name: 'vault-folders-folderId',
        params: { folderId: item.id }
      })
    },
    routerCollection (item) {
      console.log('dd')
      if (item.id === 'unassigned') {
        this.$router.push({
          name: 'vault-teams-teamId-tfolders-tfolderId',
          params: { teamId: item.organizationId, tfolderId: item.id }
        })
      } else {
        this.$router.push({
          name: 'vault-teams-teamId-tfolders-tfolderId',
          params: { teamId: item.organizationId, tfolderId: item.id }
        })
      }
    },
    addEdit (item) {
      this.$platformUtilsService.launchUri(`/web.html#/vault/${item.id}`)
    }
  }
})
</script>
