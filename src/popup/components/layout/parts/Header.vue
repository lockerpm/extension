<template>
  <div id="popup-header"
    class="fixed top-0 w-full"
  >
    <div
      class="h-auto grid grid-cols-5 navigator py-2"
    >
      <router-link
        v-for="item in menu"
        :to="{ name: item.routeName }"
        :key="item.routeName"
        class="text-center text-[14px] navigator-item"
        :class="item.routeName === $route.name ? 'text-primary' : 'text-black'"
      >
        <img
          class="navigator-item__image"
          :src="require(`@/assets/images/icons/header/${item.icon}`)"
        >
        <div class="navigator-item__title">
          {{ item.label }}
        </div>
      </router-link>
    </div>
    <!-- <div
      class="flex items-center h-[52px] leading-[44px] px-4 py-2"
    >
      <img
        src="@/assets/images/logo/logo.png"
        alt="Locker"
        class="h-[25px] mr-3"
        @click="$router.push('/')"
      >
      <el-input
        v-model="inputText"
        :placeholder="$t('data.parts.search')"
        suffix-icon="el-icon-search"
        @input="handleSearch"
      >
      </el-input>
      <div
        style="margin-left: 12px; display: flex;"
        @click="$router.push({ name: 'add-item-create', params: { type } })"
      >
        <i class="el-icon-plus text-primary text-head-5 font-semibold"></i>
      </div>
    </div> -->
    <!-- <div
      v-if="['home', 'vault', 'cards', 'identities', 'notes', 'crypto-backups', 'folders'].includes(this.$route.name)"
      id="vault-slider" class="bg-white">
      <div class="slider-container">
        <span id="arrow-left" class="px-4" @click="showPre()"><i class="fas fa-angle-left"></i></span>
        <div class="catagories-container" style="width: 80%">
          <ul class="catalog-list corporate-projects">
            <li v-for="(item, index) in vault_categories" :key="index"
              class="catalog-item landing-transition text-12 font-weight-700 text-uppercase">
              <router-link :to="{ name: item.routeName }" class="text-black">
                {{ $t(`sidebar.${item.name}`) }}
              </router-link>
            </li>
          </ul>
        </div>
        <span class="px-4" @click="showNext()"><i class="fas fa-angle-right"></i></span>
      </div>
    </div> -->
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
export default {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data() {
    return {
      inputText: ''
    }
  },
  asyncComputed: {
    locked: {
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      async get () {
        return await this.$vaultTimeoutService.isLocked()
      },
      watch: []
    },
  },
  methods: {
    handleSearch: debounce(function () {
      this.$store.commit('UPDATE_SEARCH', this.inputText)
    }, 800),
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    showPre() {
      const slider = document.querySelector('.catalog-list')
      const scrollLeft = slider.scrollLeft
      slider.scroll({
        left: scrollLeft - 150,
        behavior: 'smooth'
      })
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    showNext() {
      const slider = document.querySelector('.catalog-list')
      const scrollLeft = slider.scrollLeft
      slider.scroll({
        left: scrollLeft + 150,
        behavior: 'smooth'
      })
    },
  },
  computed: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    type() {
      switch (this.$route.name) {
      case "home":
        return "Login";
      case "notes":
        return "SecureNote";
      case "cards":
        return "Card";
      case "identities":
        return "Identity";
      case "crypto-backups":
        return "CryptoBackup";
      case "vault":
        return "Vault";
      case "shares":
        return "Shares";
      case "trash":
        return "Trash";
      default:
        return null;
      }
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    vault_categories() {
      return [
        {
          name: 'passwords',
          routeName: 'home'
        },
        {
          name: 'cards',
          routeName: 'cards'
        },
        {
          name: 'notes',
          routeName: 'notes'
        },
        {
          name: 'identities',
          routeName: 'identities'
        },
        {
          name: 'cryptoBackups',
          routeName: 'crypto-backups'
        },
        {
          name: 'folder',
          routeName: 'folders'
        }
      ]
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    menu() {
      return [
        {
          label: this.$t('data.parts.vault'),
          routeName: 'home',
          icon: 'vault.svg'
        },
        {
          label: this.$t('data.parts.folder'),
          routeName: 'folders',
          icon: 'folder.svg'
        },
        {
          label: this.$t('data.parts.otp'),
          routeName: 'otp',
          icon: 'otp.svg'
        },
        {
          label: this.$t('data.parts.generator'),
          routeName: 'generator',
          icon: 'generator.svg'
        },
        {
          label: this.$t('data.parts.settings'),
          routeName: 'settings',
          icon: 'settings.svg'
        }
      ]
    }
  }
}
</script>

<style lang="scss">
#popup-header {
  .navigator {
    background-color: white !important;
    .navigator-item {
      @apply no-underline;
      &:hover {
        .navigator-item__image {
          filter: invert(36%) sepia(82%) saturate(415%) hue-rotate(78deg) brightness(95%) contrast(91%);
        }
      }
      &__image {
        margin-left: auto;
        margin-right: auto;
      }
      &.router-link-exact-active.router-link-active {
        @apply text-primary;
        font-weight: 600;
        .navigator-item__image {
          filter: invert(36%) sepia(82%) saturate(415%) hue-rotate(78deg) brightness(95%) contrast(91%);
        }
      }
    }
  }
}
</style>

