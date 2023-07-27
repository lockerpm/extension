<template>
  <div>
    <ListCipher
      :type="cipherType"
      :folder="$route.params.data"
    />
  </div>
</template>

<script>
import ListCipher from "@/popup/components/ciphers/ListCipher";
import { CipherType } from "jslib-common/enums/cipherType";

export default {
  scrollToTop: true,
  components: {
    ListCipher
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data () {
    return {
    }
  },
  asyncComputed: {
  },
  computed: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    cipherType() {
      return this.$route.query ? Number(this.$route.query.type || CipherType.Login) : CipherType.Login
    },
  }
}
</script>

<style lang="scss" scoped>
</style>
