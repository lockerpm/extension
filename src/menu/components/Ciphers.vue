<template>
  <div
    class="menu-ciphers p-4"
  >
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
</template>

<script>
import Vue from 'vue'
import CipherRow from './CipherRow.vue'
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
        let result =
          (await this.$searchService.searchCiphers(
            this.searchText,
            [(c) => c.type === this.fillType.value, (c) => !c.isDeleted],
            null
          )) || [];

        console.log(result);
        result = result.filter((cipher) =>
          this.fillTypes.map((t) => t.value).includes(cipher.type)
        );
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
