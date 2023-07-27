<template>
  <div
    class="relative mx-auto"
    style="background: #F6F6F6; height: 600px; width: 400px"
  >
    <Header />
    <Search
      v-if="isSearch"
    />
    <div
      class="main-body p-4"
      :class="{
        'is-search pt-0': isSearch,
        'is-footer': isFooter,
        'p-0': noPadding
      }"
    >
      <router-view />
    </div>
    <Footer
      v-if="isFooter"
    />
  </div>
</template>

<script>
import Vue from 'vue'
import Header from "./components/Header.vue";
import Search from "./components/Search.vue";
import Footer from "./components/Footer.vue";

export default Vue.extend({
  components: {
    Header,
    Search,
    Footer
  },
  computed: {
    isSearch() {
      return ['vault', 'folders', 'otp'].includes(this.$route.name)
    },
    isFooter() {
      return ['vault', 'folders', 'otp'].includes(this.$route.name)
    },
    noPadding() {
      return ['generator'].includes(this.$route.name)
    }
  },
  methods: {
  }
}
)
</script>
<style lang="scss">
.main-body {
  position: absolute;
  top: 73px;
  bottom: 0px;
  width: 100%;
  overflow: auto;
  &.is-search {
    top: 137px !important;
  }
  &.is-footer {
    bottom: 40px !important;
  }
}
</style>
