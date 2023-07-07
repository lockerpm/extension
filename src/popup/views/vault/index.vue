<template>
  <div
    v-loading="$store.state.syncing"
  >
    <template>
      <!-- Login Ciphers -->
      <LoginCiphers
        v-if="cipherType == CipherType.Login"
      />
      <!-- All Passwords -->
      <ListCipher
        :type="cipherType"
      />
    </template>
  </div>
</template>

<script>
import Vue from "vue";
import LoginCiphers from "@/popup/components/ciphers/LoginCiphers.vue";
import ListCipher from "@/popup/components/ciphers/ListCipher.vue";
import { CipherType } from "jslib-common/enums/cipherType";

export default Vue.extend({
  name: "Home",
  components: {
    LoginCiphers,
    ListCipher,
  },
  data() {
    return {
      CipherType,
    };
  },
  computed: {
    cipherType() {
      return this.$route.query ? Number(this.$route.query.type || CipherType.Login) : CipherType.Login
    },
  },
  methods: {
  },
});
</script>
<style>
</style>