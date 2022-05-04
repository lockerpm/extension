<template>
  <div
    id="popup-header"
    v-if="!locked && isLoggedIn && ['home', 'vault', 'settings', 'generator'].includes(this.$route.name)"
    class="fixed top-0 bg-white cursor-pointer"
    style="z-index:1; width: 400px; border-bottom: 1px solid #C5C6C8"
  >
    <div class="h-auto grid grid-cols-3 bg-white navigator">
      <router-link
        :to="{name: item.routeName}"
        v-for="item in menu"
        :key="item.routeName"
        class="text-center text-[16px] navigator-item"
      >
        <div class="">
          <!-- <i :class="`fas fa-${item.icon}`"></i> -->
          <img class="mx-auto navigator-item__image" :src="require(`@/assets/images/${item.image}`)">
        </div>
        <div>
          {{item.label}}
        </div>
      </router-link>
    </div>
    <div v-if="['home', 'vault', 'settings'].includes(this.$route.name)" class="flex items-center h-[52px] leading-[44px] px-4 pb-4">
      <img
        src="@/assets/images/logo/logo.png"
        alt="Locker"
        class="h-[25px] mr-3"
        @click="$router.push('/')"
      >
      <template v-if="['home', 'vault'].includes(this.$route.name)">
        <el-input
          :placeholder="$t('data.parts.search')"
          suffix-icon="el-icon-search"
          v-model="searchText"
          @input="handleSearch"
        >
        </el-input>
        <div
          style="margin-left: 12px"
          @click="$router.push({ name: 'add-item-create' })"
        >
          <!-- <i class="fas fa-plus-circle hover:text-primary text-black-500 text-[20px]"></i> -->
          <img
            class="mt-3"
            src="@/assets/images/plus-circle.png"
          >
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
export default {
  data () {
    return {
      searchText: ''
    }
  },
  asyncComputed: {
    async locked () {
      return await this.$vaultTimeoutService.isLocked()
    }
  },
  methods: {
    handleSearch: debounce(function (e) {
      console.log(1)
      this.$store.commit('UPDATE_SEARCH', this.searchText)
    }, 800),
  },
  computed: {
    menu () {
      return [
        {
          label: this.$t('data.parts.vault'),
          routeName: 'vault',
          // icon: 'popup_vault.svg'
          icon: 'folder',
          image: 'vault.png'
        },
        {
          label: this.$t('data.parts.generator'),
          routeName: 'generator',
          // icon: 'popup_generate.svg'
          icon: 'sync-alt',
          image: 'generator.png'
        },
        {
          label: this.$t('data.parts.settings'),
          routeName: 'settings',
          // icon: 'popup_settings.svg'
          icon: 'cog',
          image: 'settings.png'
        }
      ]
    }
  }
}
</script>

<style lang="scss">
#popup-header .navigator-item__image{
  padding: 7.5px 22.5px;
  border-radius: 20px;
}
#popup-header .navigator-item:hover .navigator-item__image {
  background-color: #E4F0E6;
}
#popup-header .navigator {
  padding: 12.5px 0px;
}
a.navigator-item {
  @apply hover:no-underline;
}
#popup-header .router-link-exact-active.router-link-active {
  font-weight: 600;
  .navigator-item__image {
    background-color: #E4F0E6;
  }
}

</style>

