<template>
  <div
    class="flex items-center px-4 py-2 menu-filter"
  >
    <el-select
      v-if="!isOtp"
      :value="fillType.value"
      class="mr-2"
      size="small"
      style="width: 310px"
      @change="(v) => $emit('change', v)"
    >
      <el-option
        v-for="item in fillTypes"
        :key="item.value"
        :label="item.name"
        :value="item.value"
      />
    </el-select>
    <el-input
      v-model="inputText"
      suffix-icon="el-icon-search"
      size="small"
      :placeholder="$t('data.parts.search')"
      @input="handleSearch"
    >
    </el-input>
  </div>
</template>

<script lang="js">

export default {
  props: {
    fillTypes: {
      type: Array,
      default: () => []
    },
    fillType: {
      type: Object,
      default: () => ({})
    },
    isOtp: {
      type: Boolean,
      default: false
    }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data() {
    return {
      inputText: ''
    }
  },
  watch: {
    $route: {
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      handler() {
        this.inputText = '';
        this.handleSearch()
      },
      deep: true
    }
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    handleSearch () {
      this.$store.commit('UPDATE_SEARCH', this.inputText)
    },
  }
}
</script>

<style lang="scss">
</style>

