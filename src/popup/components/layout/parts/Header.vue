<template>
  <div
    id="popup-header"
    v-if="!locked && isLoggedIn && ['home', 'vault', 'settings', 'generator'].includes(this.$route.name)"
    class="fixed top-0 left-0 right-0 flex items-center bg-white cursor-pointer h-[44px] leading-[44px] px-3"
    style="z-index:1"
  >
    <img
      src="@/assets/images/logo/popup_logo.png"
      alt="Locker"
      class="h-[36px] mr-3"
      @click="$router.push('/')"
    >
    <template v-if="['home', 'vault'].includes(this.$route.name)">
      <input
        type="text"
        :value="searchText"
        class="sm:w-1/2 w-full focus:border-0 border-0 truncate"
        placeholder="Search vault"
        @input="handleSearch"
      >
      <span><i
          slot="suffix"
          class="el-icon-search el-input__icon text-20 font-weight-700 text-black"
        >
        </i></span>
      <div
        style="margin-left: 12px"
        @click="$router.push({ name: 'add-item-create' })"
      >
        <i class="fas fa-plus-circle hover:text-primary text-black-500 text-[20px]"></i>
      </div>
    </template>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
export default {
  asyncComputed: {
    async locked () {
      return await this.$vaultTimeoutService.isLocked()
    }
  },
  methods: {
    handleSearch: debounce(function (e) {
      this.$store.commit('UPDATE_SEARCH', e.target.value)
    }, 800),
  }
}
</script>

<style>
</style>
