<template>
  <div
    class="relative mx-auto"
    style="background: #F6F6F6; min-height: 600px; max-width: 400px"
  >
    <Header />
    <Search
      v-if="['home', 'folders', 'otp'].includes($route.name)"
      :cipher-type="cipherType"
      @change="handleChangeCipherType"
    />
    <router-view
      :cipher-type="cipherType"
    />
    <Footer />
  </div>
</template>

<script>
import Vue from 'vue'
import Header from "./components/Header.vue";
import Search from "./components/Search.vue";
import Footer from "./components/Footer.vue";

import { CipherType } from "jslib-common/enums/cipherType";

export default Vue.extend({
  components: {
    Header,
    Search,
    Footer
  },
  data () {
    return {
      cipherType: this.$route.params ? Number(this.$route.params.type || CipherType.Login) : CipherType.Login
    }
  },
  asyncComputed: {
  },
  computed: {
  },
  methods: {
    handleChangeCipherType(type) {
      this.cipherType = type
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      this.$router.replace({ name: this.$route.name, params: { type: type } }).catch(() => {})
    },
  }
}
)
</script>
<style>
</style>
