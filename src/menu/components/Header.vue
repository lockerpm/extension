<template>
  <div
    class="flex items-center justify-between p-4"
    style="background-color: #F6F6F6;"
  >
    <div class="flex items-center">
      <img src="@/assets/images/icons/icon_menu_logo.svg">
      <p class="ml-2">{{ title }}</p>
    </div>
    <div>
      <el-dropdown
        trigger="hover"
      >
        <div class="icon flex items-center justify-center">
          <i class="el-icon-more"></i>
        </div>
        <el-dropdown-menu
          slot="dropdown"
        >
          <el-dropdown-item
            v-for="t in tabs"
            :key="t.value"
            class="flex items-center justify-between"
            :class="t.class || ''"
            :divided="t.divided"
            @click.native="() => t.onclick()"
          >
            <span class="mr-2">
              {{ t.name }}
            </span>
            <i
              v-if="t.value === tab.value"
              class="fa fa-check"
            />
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'MenuHeader',
  props: {
    tabs: {
      type: Array,
      default: () => []
    },
    tab: {
      type: Object,
      default: () => ({})
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
    title () {
      if (this.tab.value === 1) {
        return this.tab.name
      }
      return this.fillType.title
    }
  },
  methods: {
  }
})
</script>

<style lang="scss">
</style>
