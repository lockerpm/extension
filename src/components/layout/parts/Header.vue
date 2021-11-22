<template>
  <div class="lg:px-28 px-10 h-[60px] flex items-center border-0 border-b border-black-200">
    <div class="flex-grow">
      <div v-if="shouldShowSearch" class="text-black-600">
        <i class="fa fa-search mr-4" />
        <input
          type="text"
          :value="searchText"
          class="w-1/2 focus:border-0 border-0 focus:ring-0"
          @input="handleSearch"
        >
      </div>
    </div>
    <div class="">
      <el-dropdown trigger="click">
        <div class="flex items-center">
          <el-avatar :size="35" :src="currentUser.avatar" class="mr-2" />
          <div>
            <div class="text-sm font-semibold">{{ currentUser.full_name }} <i class="el-icon-caret-bottom el-icon--right" /></div>
            <div class="text-xs text-black-600">{{ currentPlan.name }}</div>
          </div>
        </div>
        <el-dropdown-menu slot="dropdown" class="min-w-[200px]">
          <el-dropdown-item
            icon="fa fa-user-circle"
            @click.native="go('settings')"
          >
            {{ $t('data.profile_menu.account_settings') }}
          </el-dropdown-item>
          <el-dropdown-item icon="far fa-life-ring">
            {{ $t('data.profile_menu.support_center') }}
          </el-dropdown-item>
          <el-dropdown-item icon="far fa-flag">
            {{ $t('data.profile_menu.tour') }}
          </el-dropdown-item>
          <el-dropdown-item icon="far fa-comment">
            {{ $t('data.profile_menu.feedback') }}
          </el-dropdown-item>
          <el-dropdown-item icon="fas fa-lock" @click.native="lock()">
            {{ $t('data.profile_menu.lock') }}
          </el-dropdown-item>
          <el-dropdown-item icon="fas fa-sign-out-alt" @click.native="logout()">
            {{ $t('data.profile_menu.logout') }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import debounce from 'lodash/debounce'
export default Vue.extend({
  computed: {
    shouldShowSearch () {
      return ['vault', 'passwords', 'notes', 'identities', 'shares', 'trash', 'vault-tfolders-tfolderId', 'vault-folders-folderId'].includes(this.$route.name)
    },
    currentPlan () {
      return this.$store.state.currentPlan
    }
  },
  methods: {
    handleSearch: debounce(function (e) {
      this.$store.commit('UPDATE_SEARCH', e.target.value)
    }, 800),
    go (name) {
      this.$router.push({ name })
    }
  }
}
)
</script>
