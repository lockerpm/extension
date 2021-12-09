<template>
  <div>
    <div class="">
      <div class="flex justify-between items-center bg-black-300 cursor-pointer h-[44px] leading-[44px] px-5"
      >
        <div class="menu-icon mr-4" @click="$router.back()">
          <i class="fas fa-chevron-left text-[20px]"></i> Back
        </div>
        <div @click="$router.push({name: 'add-item-create', params: {type: type}})">
          <i class="fas fa-plus-circle text-[20px]"></i>
        </div>
      </div>
    </div>
    <NoCipher
      v-if="shouldRenderNoCipher"
      :type="type"
      @add-cipher="handleAddButton"
    />
    <ul class="overflow-x-auto max-h-[500px]">
      <li
        v-for="item in ciphers" :key="item.id"
        class="flex items-center hover:bg-black-400 cursor-pointer h-[62px] px-5 border-t border-black-400"
      >
        <div
            class="text-[34px] mr-3 flex-shrink-0"
            :class="{'filter grayscale': item.isDeleted}"
          >
            <Vnodes :vnodes="getIconCipher(item, 34)" />
          </div>
        <div class="flex-grow">
          <div class="text-black font-semibold truncate flex items-center">
            {{ item.name }}
          </div>
          <div>
            {{ item.subTitle }}
          </div>
        </div>
        <div>
          <div class="col-actions">
            <!--            <button-->
            <!--              v-if="item.login.canLaunch"-->
            <!--              class="btn btn-icon btn-xs hover:bg-black-400"-->
            <!--              @click="$platformUtilsService.launchUri(item.login.uri)"-->
            <!--            >-->
            <!--              <i class="fas fa-external-link-square-alt" />-->
            <!--            </button>-->
            <button
              v-if="item.login.canLaunch"
              class="btn btn-icon btn-xs hover:bg-black-400"
              :title="`Launch ${item.login.uri}`"
              @click="openNewTab(item.login.uri)"
              >
                <i class="fas fa-external-link-square-alt" />
            </button>
            <el-dropdown v-if="!item.isDeleted" trigger="click" :hide-on-click="false">
              <button class="btn btn-icon btn-xs hover:bg-black-400">
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
                    divided
                  >
                    {{ $t('common.copy') }} {{ $t('common.note') }}
                  </el-dropdown-item>
                </template>
              </el-dropdown-menu>
            </el-dropdown>
            <button class="btn btn-icon btn-xs hover:bg-black-400"
                    @click="addEdit(item)"
            >
              <i class="fas fa-pen" />
            </button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import Vue from 'vue'
import orderBy from "lodash/orderBy";
import {CipherType} from "jslib-common/enums/cipherType";
import { type } from '@/locales/en';
import { Cipher } from 'jslib-common/models/domain/cipher';
import { defaults } from 'lodash';
import Vnodes from "@/components/Vnodes";
import NoCipher from "@/components/cipher/NoCipher";
export default Vue.extend({
  components: {
    Vnodes,
    NoCipher
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
      default: c => c.type === CipherType['Login']
    }
  },
  data () {
    return {
      CipherType
    }
  },
  computed: {
    // type() {
    //   if(this.ciphers.length){
    //     const type = this.ciphers[0].type
    //     switch(type){
    //     case CipherType.Login:
    //       return 'Login'
    //     case CipherType.SecureNote:
    //       return 'SecureNote'
    //     case CipherType.Card:
    //       return 'Card';
    //     case CipherType.Identity:
    //       return 'Identity' 
    //     default:
    //       return 'Login'
    //     }
    //   }
    //   return 'Login'
    // },
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
    shouldRenderNoCipher () {
      const filteredCiphers = this.ciphers || []
      return !filteredCiphers.length
    }
  },
  asyncComputed: {
    ciphers: {
      async get () {
        const deletedFilter = c => {
          return c.isDeleted === this.deleted
        }
        let result = await this.$searchService.searchCiphers(this.searchText, [this.filter, deletedFilter], null) || []
        // remove ciphers generated by authenticator
        result = result.filter(cipher => [CipherType.Login, CipherType.SecureNote, CipherType.Card, CipherType.Identity].includes(cipher.type))
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
  mounted () {
    // this.$store.commit('UPDATE_SYNCED_CIPHERS')
  },
  methods: {
    addEdit (item) {
      this.$platformUtilsService.launchUri(`/web.html#/vault/${item.id}`)
    },
    handleAddButton(){
      this.$router.push({name: 'add-item-create', params: {type: this.type}})
    }
  }
})
</script>
