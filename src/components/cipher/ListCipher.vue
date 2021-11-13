<template>
  <div class="flex flex-col flex-column-fluid relative">
    <NoCipher
      v-if="shouldRenderNoCipher"
      :type="type"
      @add-cipher="handleAddButton"
    />
    <div v-else class="flex-column-fluid lg:px-28 py-10 px-10 mb-20">
      <div class="flex items-center justify-between mb-5">
        <div class="flex-grow">
          <el-breadcrumb separator-class="el-icon-arrow-right">
            <template v-if="$route.name === 'vault-folders-folderId'">
              <el-breadcrumb-item
                :to="{name: 'vault'}"
              >
                {{ $t('sidebar.vault') }}
              </el-breadcrumb-item>
              <el-breadcrumb-item class="flex items-center">
                {{ folder.name }}
              </el-breadcrumb-item>
            </template>
            <template v-else-if="$route.name === 'vault-teams-teamId-tfolders-tfolderId'">
              <el-breadcrumb-item
                :to="{name: 'vault'}"
              >
                {{ $t('sidebar.vault') }}
              </el-breadcrumb-item>
              <el-breadcrumb-item class="flex items-center">
                {{ getTeam(teams, $route.params.teamId).name }} - {{ collection.name }}
              </el-breadcrumb-item>
            </template>
            <template v-else-if="$route.name ==='vault'">
              <span class="font-medium">Folders</span>
            </template>
            <template v-else-if="$route.name ==='shares'">
              <span class="font-medium">Shares</span>
            </template>
            <template v-else-if="$route.name ==='trash'">
              <span class="font-medium">Trash</span>
            </template>
            <template v-else>
              <el-breadcrumb-item
                :to="{name: routeName}"
              >
                {{ $tc(`type.${type}`, 2) }}
              </el-breadcrumb-item>
            </template>
          </el-breadcrumb>
        </div>
        <div class="header-actions">
          <el-dropdown trigger="click">
            <div class="text-sm text-black-600 font-semibold">
              {{ $t('data.ciphers.sort_by') }} <i class="el-icon-caret-bottom el-icon--right" />
            </div>
            <el-dropdown-menu slot="dropdown" class="w-[200px] ">
              <el-dropdown-item
                class="flex items-center justify-between"
                @click.native="changeSort('name', 'asc')"
              >
                <span>{{ $t('data.ciphers.name') }} {{ $t('data.ciphers.ascending') }}</span>
                <i v-if="orderString==='name_asc'" class="fa fa-check" />
              </el-dropdown-item>
              <el-dropdown-item
                class="flex items-center justify-between"
                @click.native="changeSort('name', 'desc')"
              >
                <span>{{ $t('data.ciphers.name') }} {{ $t('data.ciphers.descending') }}</span>
                <i v-if="orderString==='name_desc'" class="fa fa-check" />
              </el-dropdown-item>
              <el-dropdown-item
                class="flex items-center justify-between"
                @click.native="changeSort('revisionDate', 'asc')"
              >
                <span>{{ $t('data.ciphers.time') }} {{ $t('data.ciphers.ascending') }}</span>
                <i v-if="orderString==='revisionDate_asc'" class="fa fa-check" />
              </el-dropdown-item>
              <el-dropdown-item
                class="flex items-center justify-between"
                @click.native="changeSort('revisionDate', 'desc')"
              >
                <span>{{ $t('data.ciphers.time') }} {{ $t('data.ciphers.descending') }}</span>
                <i v-if="orderString==='revisionDate_desc'" class="fa fa-check" />
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <div
        v-if="$route.name === 'vault' && folders"
        class="mb-10"
      >
        <div class="grid grid-cols-4 md:grid-cols-4 2xl:grid-cols-5 gap-6 ">
          <div
            v-for="item in folders"
            :key="item.id"
            class="px-4 py-6 flex items-center cursor-pointer rounded border border-[#E6E6E8] hover:border-primary"
            :class="{'border-primary': selectedFolder.id === item.id}"
            :title="item.name"
            @click="selectedFolder = item"
            @dblclick="routerFolder(item)"
            @contextmenu.prevent="$refs.menu.open($event, item)"
          >
            <img src="@/assets/images/icons/folderSolid.svg" alt="" class="select-none mr-2">
            <div class="font-semibold break-all select-none">{{ item.name }} ({{ item.ciphersCount }})</div>
          </div>
          <component
            :is="context"
            ref="menu"
            class="el-dropdown-menu"
            @open="openContextFolder"
          >
            <template #default>
              <li
                class="el-dropdown-menu__item w-[200px]"
                @click.prevent="addEditFolder(selectedFolder, false)"
              >
                {{ $t('common.rename') }}
              </li>
              <li
                class="el-dropdown-menu__item"
                @click.prevent="deleteFolder(selectedFolder)"
              >
                <span class="text-danger">{{ $t('common.delete') }}</span>
              </li>
            </template>
          </component>
        </div>
      </div>
      <div
        v-if="$route.name === 'vault' && collections"
        class="mb-10"
      >
        <template v-for="(value, key) in filteredCollection">
          <div :key="key" class="mb-5 font-medium">
            {{ getTeam(teams, key).name }}
          </div>
          <div :key="key" class="grid grid-cols-4 md:grid-cols-4 2xl:grid-cols-5 gap-6 ">
            <div
              v-for="item in value"
              :key="item.id"
              class="px-4 py-6 cursor-pointer rounded border border-[#E6E6E8] hover:border-primary"
              :class="{'border-primary': selectedFolder.id === item.id}"
              :title="`${item.name} (${item.ciphersCount})`"
              @click="selectedFolder = item"
              @dblclick="routerCollection(item)"
              @contextmenu.prevent="canManageFolder(teams, item) ? $refs.menuTeam.open($event, item) : null"
            >
              <div class="flex items-center">
                <img src="@/assets/images/icons/folderSolidShare.svg" alt="" class="select-none mr-2">
                <div class="font-semibold truncate select-none">{{ item.name }} ({{ item.ciphersCount }})</div>
              </div>
            </div>
            <div
              class="px-4 py-6 cursor-pointer rounded border border-[#E6E6E8] hover:border-primary"
              :class="{'border-primary': selectedFolder.id === 'unassigned'}"
              @click="selectedFolder = {id: 'unassigned'}"
              @dblclick="routerCollection({id: 'unassigned', organizationId: key})"
            >
              <div class="flex items-center">
                <img src="@/assets/images/icons/folderSolid.svg" alt="" class="select-none mr-2">
                <div class="font-semibold truncate select-none">{{ $t('data.ciphers.unassigned_folder') }} ({{ countUnassignedItems(ciphers, key) }})</div>
              </div>
            </div>
          </div>
        </template>
        <component
          :is="context"
          ref="menuTeam"
          class="el-dropdown-menu"
          @open="openContextTeamFolder"
        >
          <template #default>
            <li
              class="el-dropdown-menu__item w-[200px]"
              @click.prevent="addEditTeamFolder(selectedFolder, false)"
            >
              {{ $t('common.rename') }}
            </li>
            <li
              v-if="isBiz(getTeam(teams, selectedFolder.organizationId))"
              class="el-dropdown-menu__item w-[200px]"
              @click.prevent="putTeamFolderUsers(selectedFolder)"
            >
              {{ $t('data.groups.user_access') }}
            </li>
            <li
              v-if="isBiz(getTeam(teams, selectedFolder.organizationId))"
              class="el-dropdown-menu__item w-[200px]"
              @click.prevent="putTeamFolderGroups(selectedFolder)"
            >
              {{ $t('data.folders.user_access') }}
            </li>
            <li
              class="el-dropdown-menu__item"
              @click.prevent="deleteTeamFolder(selectedFolder)"
            >
              <span class="text-danger">{{ $t('common.delete') }}</span>
            </li>
          </template>
        </component>
      </div>
      <div
        v-if="$route.name === 'vault'"
        class="mb font-medium"
      >
        {{ $t('data.ciphers.all_items') }}
      </div>
      <el-table
        ref="multipleTable"
        :data="ciphers || []"
        style="width: 100%"
        row-class-name="hover-table-row"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column
          prop="name"
          label=""
          show-overflow-tooltip
        >
          <template slot="header">
            <div v-if="multipleSelection.length" class="flex items-center ">
              <div class="text-black mr-8 whitespace-nowrap">
                {{ multipleSelection.length }} {{ $t('data.ciphers.selected_items') }}
              </div>
              <div v-if="deleted">
                <button
                  class="btn btn-default btn-xs"
                  @click="restoreCiphers(multipleSelection.map(e => e.id))"
                >
                  {{ $t('common.restore') }}
                </button>
                <button
                  class="btn btn-default btn-xs !text-danger"
                  @click="deleteCiphers(multipleSelection.map(e => e.id))"
                >
                  {{ $t('common.permanently_delete') }}
                </button>
              </div>
              <div v-else class="">
                <button
                  class="btn btn-default btn-xs"
                  @click="moveFolders(multipleSelection.map(e => e.id))"
                >
                  {{ $t('common.move_folder') }}
                </button>
                <button
                  class="btn btn-default btn-xs !text-danger"
                  @click="moveTrashCiphers(multipleSelection.map(e => e.id))"
                >
                  {{ $t('common.delete') }}
                </button>
              </div>
            </div>
          </template>
          <template slot-scope="scope">
            <div class="flex items-center">
              <div
                class="text-[34px] mr-3 flex-shrink-0"
                :class="{'filter grayscale': scope.row.isDeleted}"
              >
                <Vnodes :vnodes="getIconCipher(scope.row, 34)" />
              </div>
              <div class="flex flex-col">
                <a
                  class="text-black font-semibold truncate flex items-center"
                  :class="{'opacity-80': scope.row.isDeleted}"
                  @click="routerCipher(scope.row, addEdit)"
                >
                  {{ scope.row.name }}
                  <img v-if="scope.row.organizationId" src="@/assets/images/icons/shares.svg" alt="Shared" :title="$t('common.shared_with_you')"  class="inline-block ml-2">
                </a>
                <div>
                  {{ scope.row.subTitle }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          align="right"
          :label="$t('common.ownership')"
          width="200"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>{{ getTeam(teams, scope.row.organizationId).name || $t('common.me') }}</span>
          </template>
        </el-table-column>
        <el-table-column
          width="200"
          align="right"
          :label="$t('data.ciphers.updated_time')"
        >
          <template slot-scope="scope">
            {{ $moment(scope.row.revisionDate).fromNow() }}
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
                @click="openNewTab(scope.row.login.uri)"
              >
                <i class="fas fa-external-link-square-alt" />
              </button>
              <el-dropdown v-if="canManageItem(teams, scope.row)" trigger="click" :hide-on-click="false">
                <button class="btn btn-icon btn-xs hover:bg-black-400">
                  <i class="fas fa-ellipsis-h" />
                </button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="addEdit(scope.row)">
                    {{ $t('common.edit') }}
                  </el-dropdown-item>
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
                  <template v-if="!scope.row.isDeleted">
                    <el-dropdown-item divided @click.native="cloneCipher(scope.row)">
                      {{ $t('common.clone') }}
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-if="!scope.row.organizationId && canManageTeamFolder"
                      @click.native="shareItem(scope.row)"
                    >
                      {{ $t('common.share') }}
                    </el-dropdown-item>
                    <el-dropdown-item @click.native="moveFolders([scope.row.id])">
                      {{ $t('common.move_folder') }}
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-if="scope.row.organizationId && canManageTeamFolder"
                      divided
                      @click.native="shareItem(scope.row)"
                    >
                      {{ $t('common.collections') }}
                    </el-dropdown-item>
                    <el-dropdown-item divided @click.native="moveTrashCiphers([scope.row.id])">
                      <span class="text-danger">{{ $t('common.delete') }}</span>
                    </el-dropdown-item>
                  </template>
                  <template v-else>
                    <el-dropdown-item divided @click.native="restoreCiphers([scope.row.id])">
                      {{ $t('common.restore') }}
                    </el-dropdown-item>
                    <el-dropdown-item @click.native="deleteCiphers([scope.row.id])">
                      <span class="text-danger">{{ $t('common.permanently_delete') }}</span>
                    </el-dropdown-item>
                  </template>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <AddEditCipher ref="addEditCipherDialog" :type="type" />
    <ChooseCipherType ref="chooseCipherType" />
    <AddEditFolder ref="addEditFolder" />
    <AddEditTeamFolder ref="addEditTeamFolder" />
    <AddEditTeamFolderUsers ref="addEditTeamFolderUsers" />
    <AddEditTeamFolderGroups ref="addEditTeamFolderGroups" />
    <ShareCipher ref="shareCipher" />
    <MoveFolder ref="moveFolder" @reset-selection="multipleSelection = []" />
    <div class="fixed bottom-[50px] right-[55px]">
      <el-popover
        v-if="['vault'].includes(routeName)"
        placement="right-end"
        width="200"
        trigger="click"
        popper-class="!p-0"
      >
        <div class="text-black">
          <div class="px-5 pt-5 text-xs">
            {{ $t('common.add') }}
          </div>
          <ul class="el-dropdown-menu !static !border-0 !shadow-none">
            <li
              v-if="$route.name ==='vault'"
              class="el-dropdown-menu__item font-semibold !text-black"
              @click="addEditFolder({}, true)"
            >
              {{ $t('data.folders.add_folder') }}
            </li>
            <li
              v-if="$route.name ==='vault' && canCreateTeamFolder"
              class="el-dropdown-menu__item font-semibold !text-black"
              @click="addEditTeamFolder({})"
            >
              {{ $t('data.folders.add_team_folder') }}
            </li>
            <li
              class="el-dropdown-menu__item font-semibold !text-black"
              @click="chooseCipherType"
            >
              {{ $t('data.ciphers.add_item') }}
            </li>
          </ul>
        </div>
        <button
          slot="reference"
          class="btn btn-fab rounded-full flex items-center justify-center btn-primary"
        >
          <i class="fas fa-plus text-[24px]" />
        </button>
      </el-popover>
      <button
        v-else
        class="btn btn-fab btn-primary rounded-full flex items-center justify-center"
        @click="handleAddButton"
      >
        <i class="fas fa-plus text-[24px]" />
      </button>
    </div>
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
import ChooseCipherType from '@/components/cipher/ChooseCipherType'
import AddEditFolder from '@/components/folder/AddEditFolder'
import AddEditTeamFolder from '@/components//folder/AddEditTeamFolder'
import AddEditTeamFolderUsers from '@/components//folder/AddEditTeamFolderUsers'
import AddEditTeamFolderGroups from '@/components//folder/AddEditTeamFolderGroups'
import ShareCipher from '@/components/cipher/ShareCipher'
import MoveFolder from '@/components/folder/MoveFolder'
import Vnodes from "@/components/Vnodes";
export default Vue.extend({
  components: {
    NoCipher,
    AddEditCipher,
    ChooseCipherType,
    AddEditFolder,
    AddEditTeamFolder,
    AddEditTeamFolderUsers,
    AddEditTeamFolderGroups,
    ShareCipher,
    MoveFolder,
    Vnodes,
    VueContext: () => import('@/plugins/vue-context'),
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
  data () {
    return {
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
      return this.teams.some(e => ['owner', 'admin', 'manager'].includes(e.role))
    },
    canCreateTeamFolder () {
      return this.teams.some(e => ['owner', 'admin'].includes(e.role))
    }
  },
  mounted () {
    this.context = 'VueContext'
  },
  asyncComputed: {
    ciphers: {
      async get () {
        const deletedFilter = c => {
          return c.isDeleted === this.deleted
        }
        const result = await this.$searchService.searchCiphers(this.searchText, [this.filter, deletedFilter], null) || []

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
  methods: {
    addEdit (cipher) {
      this.$refs.addEditCipherDialog.openDialog(cloneDeep(cipher))
    },
    handleAddButton () {
      if (this.$route.name === 'vault-tfolders-tfolderId' && !this.collection.readOnly) {
        this.addEdit({
          organizationId: this.collection.organizationId
        })
      } else if (!['vault', 'shares'].includes(this.$route.name)) {
        this.addEdit({})
      } else {
        this.chooseCipherType()
      }
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    cloneCipher (cipher) {
      const _cipher = cloneDeep(cipher)
      delete _cipher.id
      this.$refs.addEditCipherDialog.openDialog(_cipher, true)
    },
    moveFolders (ids) {
      this.$refs.moveFolder.openDialog(ids)
    },
    deleteCiphers (ids) {
      this.$refs.addEditCipherDialog.deleteCiphers(ids)
    },
    restoreCiphers (ids) {
      this.$refs.addEditCipherDialog.restoreCiphers(ids)
    },
    moveTrashCiphers (ids) {
      this.$refs.addEditCipherDialog.moveTrashCiphers(ids)
    },
    changeSort (orderField, orderDirection) {
      this.orderField = orderField
      this.orderDirection = orderDirection
    },
    routerFolder (item) {
      this.$router.push({
        name: 'vault-folders-folderId',
        params: { folderId: item.id }
      })
    },
    routerCollection (item) {
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
    openContextFolder (event, data) {
      this.selectedFolder = data
    },
    openContextTeamFolder (event, data) {
      this.selectedFolder = data
    },
    addEditFolder (folder, shouldRedirect = false) {
      this.$refs.addEditFolder.openDialog(folder, shouldRedirect)
    },
    addEditTeamFolder (folder, shouldRedirect = false) {
      this.$refs.addEditTeamFolder.openDialog(folder, shouldRedirect)
    },
    deleteFolder (folder) {
      this.$refs.addEditFolder.deleteFolder(folder)
    },
    deleteTeamFolder (folder) {
      this.$refs.addEditTeamFolder.deleteFolder(folder)
    },
    shareItem (cipher) {
      this.$refs.shareCipher.openDialog(cipher)
    },
    putTeamFolderGroups (folder) {
      this.$refs.addEditTeamFolderGroups.openDialog(folder)
    },
    putTeamFolderUsers (folder) {
      this.$refs.addEditTeamFolderUsers.openDialog(folder)
    },
    chooseCipherType () {
      this.$refs.chooseCipherType.openDialog()
    },
    countUnassignedItems (ciphers = [], organizationId) {
      if (ciphers) {
        const filteredCipher = ciphers.filter(c => c.organizationId === organizationId && c.collectionIds.length === 0)
        return filteredCipher.length
      }
      return 0
    },
    canDeleteTeamFolder (team) {
      return ['owner', 'admin'].includes(team.role) && !team.locked
    },
    isBiz (team) {
      return team.is_business
    }
  }
})
</script>
