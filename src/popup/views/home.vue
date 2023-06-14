<template>
  <div class="vault-body">
    <div
      class="px-4 pb-4"
    >
      <template>
        <!-- Login Ciphers -->
        <LoginCiphers
          v-if="cipherType === CipherType.Login"
          @do-fill="fillCipher"
        />
        <!-- All Passwords -->
        <ListCipher
          :type="cipherType"
          @do-fill="fillCipher"
        />
      </template>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import LoginCiphers from "@/popup/components/ciphers/LoginCiphers.vue";
import ListCipher from "@/popup/components/ciphers/ListCipher.vue";
import { CipherType } from "jslib-common/enums/cipherType";
import { BrowserApi } from "@/browser/browserApi";
import { CipherRepromptType } from "jslib-common/enums/cipherRepromptType";

export default Vue.extend({
  name: "Home",
  components: {
    LoginCiphers,
    ListCipher,
  },
  props: {
    cipherType: {
      type: Number,
      default: CipherType.Login
    }
  },
  data() {
    return {
      CipherType,
    };
  },
  methods: {
    async fillCipher(cipher) {
      if (
        cipher.reprompt !== CipherRepromptType.None &&
        !(await this.$passwordRepromptService.showPasswordPrompt())
      ) {
        return;
      }

      this.totpCode = null;
      if (this.totpTimeout != null) {
        self.clearTimeout(this.totpTimeout);
      }

      if (this.pageDetails == null || this.pageDetails.length === 0) {
        this.notify(this.$t("errors.autofill"), "error");
        return;
      }
      try {
        this.totpCode = await this.$autofillService.doAutoFill({
          cipher: cipher,
          pageDetails: this.pageDetails,
          fillNewPassword: true,
        });
        if (this.totpCode != null) {
          this.$platformUtilsService.copyToClipboard(this.totpCode, {
            window: self,
          });
        }
        if (this.$popupUtilsService.inPopup(self)) {
          if (
            this.$platformUtilsService.isFirefox() ||
            this.$platformUtilsService.isSafari()
          ) {
            BrowserApi.closePopup(self);
          } else {
            setTimeout(() => BrowserApi.closePopup(self), 50);
          }
        }
      } catch (e) {
        this.notify(this.$t("errors.autofill"), "error");
      }
    },
  },
});
</script>
<style>
</style>