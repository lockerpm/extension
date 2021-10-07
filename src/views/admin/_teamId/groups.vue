<template>
  <div class="flex flex-col flex-column-fluid relative">
    <div class="flex-column-fluid lg:px-28 py-10 px-10 mb-20">
      <client-only>
        <el-table
          v-loading="loading"
          :data="groups"
          style="width: 100%"
        >
          <el-table-column
            :label="$t('data.groups.groups')"
          >
            <template slot-scope="scope">
              <div class="flex items-center">
                <img src="@/assets/images/icons/group.svg" alt="" class="select-none">
                <div class="ml-2">
                  <div class="text-black truncate">{{ scope.row.name }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            align="right"
          >
            <template slot-scope="scope">
              <el-dropdown trigger="click" :hide-on-click="false">
                <button class="btn btn-icon btn-xs hover:bg-black-400">
                  <i class="fas fa-ellipsis-h" />
                </button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    @click.native="putGroup(scope.row)"
                  >
                    {{ $t('common.edit') }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    @click.native="putGroupUsers(scope.row)"
                  >
                    {{ $t('common.users') }}
                  </el-dropdown-item>
                  <el-dropdown-item @click.native="deleteGroup(scope.row)">
                    <span class="text-danger">
                      {{ $t('common.remove') }}
                    </span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </client-only>
    </div>
    <AddEditGroup ref="addEditGroup" @done="getGroups" />
    <AddEditGroupUsers ref="addEditGroupUsers" @done="getGroups" />
    <div class="fixed bottom-[50px] right-[55px]">
      <button
        class="btn btn-fab btn-primary rounded-full flex items-center justify-center"
        @click="postGroup({})"
      >
        <i class="fas fa-plus text-[24px]" />
      </button>
    </div>
  </div>
</template>

<script>
import AddEditGroup from '../../../components/groups/AddEditGroup'
import AddEditGroupUsers from '../../../components/groups/AddEditGroupUsers'
export default {
  components: {
    AddEditGroup, AddEditGroupUsers
  },
  data () {
    return {
      groups: [],
      loading: true
    }
  },
  mounted () {
    this.getGroups()
  },
  methods: {
    postGroup () {
      this.$refs.addEditGroup.openDialog({})
    },
    getGroups () {
      this.loading = true
      this.axios.get(`cystack_platform/pm/teams/${this.$route.params.teamId}/groups`)
        .then(res => {
          this.groups = res
          this.loading = false
        })
    },
    putGroup (group) {
      this.$refs.addEditGroup.openDialog(group)
    },
    putGroupUsers (group) {
      this.$refs.addEditGroupUsers.openDialog(group)
    },
    deleteGroup (group) {
      this.$refs.addEditGroup.deleteUser(group)
    }
  }
}
</script>
