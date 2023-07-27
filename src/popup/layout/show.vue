<template>
  <div
    class="relative mx-auto"
    style="background: #F6F6F6; height: 600px; width: 400px"
  >
    <ShowHeader />
    <Search
      v-if="isSearch"
      is-detail
    />
    <div
      class="show-body px-4 py-4"
      :class="{
        'is-search pt-0': isSearch,
        'is-setting': isSetting,
        'is-add-edit-cipher': isAddEditCipher
      }"
    >
      <router-view />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import ShowHeader from "./components/ShowHeader.vue";
import Search from "./components/Search.vue";

export default Vue.extend({
  components: {
    ShowHeader,
    Search
  },
  data () {
    return {
    }
  },
  asyncComputed: {
  },
  computed: {
    isSearch() {
      return ['folder-detail'].includes(this.$route.name)
    },
    isSetting() {
      return this.$route.name.includes('settings')
    },
    isAddEditCipher() {
      return this.$route.name === 'add-edit-cipher'
    }
  },
  methods: {
  }
}
)
</script>
<style lang="scss">
.show-body {
  position: absolute !important;
  top: 60px;
  bottom: 0px;
  width: 100% !important;
  overflow: auto !important;
  &.is-search {
    top: 124px !important;
  }
  &.is-setting {
    background: white !important;
  }
  &.is-add-edit-cipher {
    bottom: 72px !important;
  }
}
</style>
