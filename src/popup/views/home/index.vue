<template>
  <div class="vau">
    <div
      class="p-4 text-[#A2A3A7]"
    >
      <template>
        <!-- Login Ciphers -->
        <LoginCiphers />
        <!-- All Passwords -->
        <ListCipher
          :filter="c => c.type === CipherType['Login']"
          route-name="home"
        />
      </template>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { CipherType } from "jslib-common/enums/cipherType";
import LoginCiphers from "@/popup/components/ciphers/LoginCiphers.vue";
import ListCipher from "@/popup/components/ciphers/ListCipher.vue";

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
  methods: {
  },
});
</script>
<style>
</style>