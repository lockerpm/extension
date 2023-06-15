<template>
  <el-row
    class="sort-menu mb-2"
    type="flex"
    justify="space-between items-center font-semibold"
  >
    <div class="text-gray">
      {{ label }} ({{ ciphers ? ciphers.length : 0 }})
    </div>
    <div class="flex items-center">
      <div class="mr-2">{{ currentSort.label }}</div>
      <el-dropdown trigger="click">
        <span class="el-dropdown-link">
          <img src="@/assets/images/icons/sort.svg">
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="item in sortBy"
            :key="item.index"
            class="flex items-center justify-between"
            @click.native="changeSort(item.value)"
          >
            <span class="mr-2">
              {{ item.label }}
            </span>
            <i
              v-if="item.value === currentSort.value"
              class="fa fa-check"
            />
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </el-row>
</template>

<script>

export default {
  name: 'SortMenu',
  props: {
    label: {
      type: String
    },
    ciphers: {
      type: Array
    },
    orderField: {
      type: String,
    },
    orderDirection: {
      type: String
    }
  },
  computed: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    sortBy () {
      return [
        {
          label: this.$t('sort.name_asc'),
          value: 'name_asc'
        },
        {
          label: this.$t('sort.name_desc'),
          value: 'name_desc'
        },
        {
          label: this.$t('sort.time_asc'),
          value: 'revisionDate_asc'
        },
        {
          label: this.$t('sort.time_desc'),
          value: 'revisionDate_desc'
        }
      ]
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    currentSort () {
      const key = `${this.orderField}_${this.orderDirection}`
      return this.sortBy.find((s) => s.value === key) || this.sortBy[0]
    },
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    changeSort (sortValue) {
      this.$emit('sort', {
        orderField: sortValue.split('_')[0],
        orderDirection: sortValue.split('_')[1]
      })
    },
  }
}
</script>
<style lang="scss">
</style>
