<template>
  <div class="flex flex-col flex-column-fluid relative">
    <div class="flex-column-fluid lg:px-28 py-10 px-10 mb-20">
      <client-only>
        <el-table
          :data="collections || []"
          style="width: 100%"
        >
          <el-table-column
            label="Folders"
          >
            <template slot-scope="scope">
              <div class="flex items-center">
                <img src="@/assets/images/icons/folderSolidShare.svg" alt="" class="select-none">
                <div class="ml-2">
                  <router-link
                    tag="a"
                    :to="{name: 'vault-tfolders-tfolderId', params: {tfolderId: scope.row.id}}"
                    class="text-black truncate"
                  >
                    {{ scope.row.name }}
                  </router-link>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            align="right"
          >
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
                    @click.native="addEditFolder(scope.row)"
                  >
                    <span class="">{{ $t('common.edit') }}</span>
                  </el-dropdown-item>
                  <el-dropdown-item
                    @click.native="putTeamFolderUsers(scope.row)"
                  >
                    <span class="">{{ $t('common.users') }}</span>
                  </el-dropdown-item>
                  <el-dropdown-item
                    @click.native="putTeamFolderGroups(scope.row)"
                  >
                    <span class="">{{ $t('common.groups') }}</span>
                  </el-dropdown-item>
                  <el-dropdown-item
                    divided
                    @click.native="deleteFolder(scope.row)"
                  >
                    <span class="text-danger">{{ $t('common.remove') }}</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </client-only>
    </div>

    <AddEditTeamFolderGroups ref="addEditTeamFolderGroups" />
    <AddEditTeamFolderUsers ref="addEditTeamFolderUsers" />
    <AddEditTeamFolder ref="addEditTeamFolder" />
    <div class="fixed bottom-[50px] right-[55px]">
      <button
        class="btn btn-fab btn-primary rounded-full flex items-center justify-center"
        @click="addEditFolder({organizationId: $route.params.teamId})"
      >
        <i class="fas fa-plus text-[24px]" />
      </button>
    </div>
  </div>
</template>

<script>
import AddEditTeamFolderGroups from '../../../components/folder/AddEditTeamFolderGroups'
import AddEditTeamFolderUsers from '../../../components/folder/AddEditTeamFolderUsers'
import AddEditTeamFolder from '../../../components/folder/AddEditTeamFolder'
export default {
  components: {
    AddEditTeamFolderGroups, AddEditTeamFolderUsers, AddEditTeamFolder
  },
  data () {
    return {
      users: []
    }
  },
  mounted () {
  },
  asyncComputed: {
    collections: {
      async get () {
        const collections = await this.$collectionService.getAllDecrypted() || []
        return collections.filter(c => !c.readOnly && c.organizationId === this.$route.params.teamId)
      },
      watch: ['$store.state.syncedCiphersToggle']
    }
  },
  methods: {
    addEditFolder (folder) {
      this.$refs.addEditTeamFolder.openDialog(folder)
    },
    deleteFolder (folder) {
      this.$refs.addEditTeamFolder.deleteFolder(folder)
    },
    putTeamFolderGroups (folder) {
      this.$refs.addEditTeamFolderGroups.openDialog(folder)
    },
    putTeamFolderUsers (folder) {
      this.$refs.addEditTeamFolderUsers.openDialog(folder)
    }
  }
}
</script>
