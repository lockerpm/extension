<template>
  <div class="lg:px-28 px-10 h-[60px] flex items-center border-0 border-b border-black-200">
    <div class="flex-grow">
      <el-select
        :value="currentTeam"
        :placeholder="$t('common.select_target')"
        class="middle-item"
        value-key="id"
        @change="selectProgram"
      >
        <el-option
          v-for="item in teams.filter(e => e.is_business)"
          :key="item.id"
          :label="item.name"
          :value="item"
        />
      </el-select>
    </div>
    <div class="">
      <el-dropdown trigger="click">
        <div class="flex items-center">
          <span
            v-if="currentTeam.id"
            class="w-[35px] h-[35px] rounded-full border flex items-center justify-center mr-2"
            :style="`borderColor: ${intToRGB(hashCode(currentTeam.name+currentTeam.id))}!important`"
          >
            <span class="text-black font-bold uppercase">{{ getAvatarString(currentTeam.name) }}</span>
          </span>
          <el-avatar v-else :size="35" :src="currentUser.avatar" class="mr-2" />
          <div>
            <div class="text-sm text-black font-semibold">{{ currentTeam.name }} <i class="el-icon-caret-bottom el-icon--right" /></div>
            <div class="text-xs text-black-600">{{ $t(`data.members.role.${currentTeam.role}.title`) }}</div>
          </div>
        </div>
        <el-dropdown-menu slot="dropdown" class="min-w-[200px]">
          <el-dropdown-item class="text-warning" @click.native="goVault">
            {{ $t('data.admin_menu.my_vault') }}
          </el-dropdown-item>
          <el-dropdown-item class="text-warning" divided @click.native="goSetting">
            {{ $t('data.admin_menu.team_profile') }}
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="lock">
            {{ $t('data.profile_menu.lock') }}
          </el-dropdown-item>
          <el-dropdown-item @click.native="logout">
            <span class="text-danger">{{ $t('data.profile_menu.logout') }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    currentTeam () {
      return this.$store.state.currentTeam
    }
  },
  methods: {
    goVault () {
      this.$router.push({ name: 'vault' })
    },
    goSetting () {
      this.$router.push({ name: 'admin-teamId-settings', params: { teamId: this.$route.params.teamId }})
    },
    getAvatarString (string) {
      const matches = string.match(/\b(\w)/g)
      if (matches && matches.length > 1) {
        return matches.join('').substring(0, 2)
      }

      return string.substring(0, 2)
    },
    hashCode (str) { // java String#hashCode
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
      }
      return hash
    },
    intToRGB (i) {
      const c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase()

      return '#' + '00000'.substring(0, 6 - c.length) + c
    },
    selectProgram (value) {
      this.$router.push(this.localeRoute({ name: 'admin-teamId', params: { teamId: value.id } }))
    }
  }
}
</script>
