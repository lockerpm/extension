<template>
  <div
    class="menu-ciphers p-4"
  >
    <div v-if="shouldRenderNoCipher" class="text-center">
      {{ fillType.empty }}
    </div>
    <div v-else>
      <div class="mb-2 font-semibold text-gray">
        {{ fillType.name }} ({{ ciphers ? ciphers.length : 0 }})
      </div>
      <ul class="list-ciphers">
        <CipherRow
          v-for="item in (ciphers || [])"
          :key="item.id"
          :item="item"
          @do-fill="$emit('do-fill', item)"
        />
      </ul>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import CipherRow from './CipherRow.vue'
import { BrowserApi } from "@/browser/browserApi";
import { CipherType } from "jslib-common/enums/cipherType";
export default Vue.extend({
  name: 'MenuCiphers',
  components: { CipherRow },
  props: {
    fillTypes: {
      type: Array,
      default: () => []
    },
    fillType: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
    }
  },
  computed: {
    shouldRenderNoCipher() {
      const filteredCiphers = this.ciphers || [];
      return !filteredCiphers.length;
    },
  },
  asyncComputed: {
    ciphers: {
      async get() {
        let result = []
        if (this.fillType.value === 0) {
          const tab = await BrowserApi.getTabFromCurrentWindow();
          if (!tab) {
            result = []
          } else {
            result = await this.$cipherService.getAllDecryptedForUrl( tab.url) || [];
            result = result.filter((c) => c.type === CipherType.Login && !c.isDeleted && c.name?.toLowerCase()?.includes(this.searchText?.toLowerCase()))
            result = this.$cipherService.sortCiphers(result) || [];
          }
        } else {
          result =
            (await this.$searchService.searchCiphers(
              this.searchText,
              [(c) => c.type === this.fillType.value, (c) => !c.isDeleted],
              null
            )) || [];
  
          result = result.filter((cipher) =>
            this.fillTypes.map((t) => t.value).includes(cipher.type)
          );
        }
        return result
      },
      watch: [
        "$store.state.syncedCiphersToggle",
        "searchText",
        "fillType",
      ],
    }
  },
})
</script>

<style lang="scss">
</style>
