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
      <ul v-if="fillType.value !== CipherType.OTP" class="list-ciphers">
        <CipherRow
          v-for="item in (pagingCiphers || [])"
          :fill-type="fillType"
          :key="item.id"
          :item="item"
          @do-fill="$emit('do-fill', item)"
        />
      </ul>
      <ul v-else class="list-ciphers">
        <OTPRow
          v-for="item in (pagingCiphers || [])"
          :key="item.id"
          :item="item"
        />
      </ul>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import CipherRow from './CipherRow.vue'
import OTPRow from './OTPRow.vue'
import { BrowserApi } from "@/browser/browserApi";
import { CipherType } from "jslib-common/enums/cipherType";
export default Vue.extend({
  name: 'MenuCiphers',
  components: { CipherRow, OTPRow },
  props: {
    fillType: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      CipherType,
      pageSize: 10,
      size: 10
    }
  },
  computed: {
    shouldRenderNoCipher() {
      if (this.ciphers) {
        return !this.ciphers.length;
      }
      return false
    },
    pagingCiphers() {
      if (this.ciphers) {
        return this.ciphers.slice(0, this.size)
      }
      return []
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
            const ciphers = (await this.$searchService.searchCiphers(
              this.searchText,
              [(c) => c.type === CipherType.Login, (c) => !c.isDeleted],
              null,
              tab,
            )) || [];
            result = this.$cipherService.sortCiphers(ciphers) || [];
          }
        } else {
          result =
            (await this.$searchService.searchCiphers(
              this.searchText,
              [(c) => c.type === this.fillType.value, (c) => !c.isDeleted],
              null
            )) || [];
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
  watch: {
    fillType: 'typeChanged'
  },
  mounted () {
    const mainBody = document.querySelector('.menu-info')
    if (mainBody) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this
      mainBody.addEventListener('scrollend', () => {
        if (self.ciphers && self.ciphers.length > self.size) {
          self.size = self.pageSize + self.size
        }
      })
    }
  },
  methods: {
    typeChanged() {
      const mainBody = document.querySelector('.menu-info')
      if (mainBody) {
        mainBody.scrollTo({ top: 0, behavior: 'smooth' })
      }
      setTimeout(() => {
        this.size = this.pageSize
      }, 1000);
    }
  }
})
</script>

<style lang="scss">
</style>
