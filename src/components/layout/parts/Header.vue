<template>
  <div class="px-5 h-[56px] flex items-center border-0 border-b border-black-200">
    <div class="flex-grow">
      <img src="@/assets/images/logo/logo_black.svg" alt="" class="h-[28px]">
    </div>
    <div class="">
      <button class="btn btn-icon">
        <IconAdd />
      </button>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import Vue from 'vue'
import {IconAdd} from "@/assets/icons";

export default Vue.extend({
  components: {
    IconAdd
  },
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
})
</script>
