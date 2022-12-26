<template>
  <div id="popup-header"
    v-if="!locked && isLoggedIn && ['home', 'vault', 'settings', 'generator', 'otp', 'cards', 'identities', 'notes', 'crypto-backups', 'folders'].includes(this.$route.name)"
    class="fixed top-0 bg-white cursor-pointer" style="z-index:1; width: 400px;">
    <div class="h-auto grid grid-cols-4 bg-white navigator">
      <router-link v-for="item in menu" :to="{ name: item.routeName }" :key="item.routeName"
        class="text-center text-[16px] navigator-item text-black">
        <img class="navigator-item__image" :src="require(`@/assets/images/icons/header/${item.icon}`)">
        <div>
          {{ item.label }}
        </div>
        <hr class="bg-primary mx-auto mt-2" style="width: 32px; height: 2px; opacity: 0;">
      </router-link>
    </div>
    <div
      v-if="['home', 'vault', 'cards', 'identities', 'notes', 'crypto-backups', 'folders'].includes(this.$route.name)"
      class="flex items-center h-[52px] leading-[44px] px-4 pb-4" style="border-bottom: 1px solid #C5C6C8">
      <img src="@/assets/images/logo/logo.png" alt="Locker" class="h-[25px] mr-3" @click="$router.push('/')">
      <el-input :placeholder="$t('data.parts.search')" suffix-icon="el-icon-search" v-model="inputText"
        @input="handleSearch">
      </el-input>
      <div style="margin-left: 12px; display: flex;"
        @click="$router.push({ name: 'add-item-create', params: { type } })">
        <i class="el-icon-plus text-primary text-head-5 font-semibold"></i>
      </div>
    </div>
    <div
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
    </div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
export default {
  data() {
    return {
      inputText: ''
    }
  },
  asyncComputed: {
    async locked() {
      return await this.$vaultTimeoutService.isLocked()
    }
  },
  methods: {
    handleSearch: debounce(function (e) {
      this.$store.commit('UPDATE_SEARCH', this.inputText)
    }, 800),
    showPre() {
      const slider = document.querySelector('.catalog-list')
      const scrollLeft = slider.scrollLeft
      slider.scroll({
        left: scrollLeft - 150,
        behavior: 'smooth'
      })
    },
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
    menu() {
      return [
        {
          label: this.$t('data.parts.vault'),
          routeName: ['home', 'cards', 'notes', 'identities', 'crypto-backups', 'folders'].includes(this.$route.name) ? this.$route.name : 'home',
          icon: 'vault.svg'
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
#popup-header .navigator-item__image {
  margin-left: auto;
  margin-right: auto;
  padding: 7.5px 0px;
  border-radius: 20px;
}

#popup-header .navigator-item:hover .navigator-item__image {
  transition: ease-in-out;
  transition-duration: 200ms;
}

#popup-header .navigator {
  padding: 12.5px 0px;
}

a.navigator-item:hover {
  @apply no-underline;

  .navigator-item__image {
    transition: ease-in-out;
    transition-duration: 200ms;

    .icon-highlight path {
      stroke: #1C7029;
    }
  }
}

#popup-header .navigator .navigator-item__image {
  color: white;

  .icon-highlight {
    @apply mx-auto;
  }
}

#popup-header .navigator .router-link-exact-active.router-link-active {
  @apply text-primary;
  font-weight: 600;

  .navigator-item__image {
    @apply text-primary-HOVER;
    transition: ease-in-out;
    transition-duration: 200ms;

    .icon-highlight path {
      stroke: #1C7029;
    }
  }

  hr {
    opacity: 1 !important;
  }
}

#popup-header .slider-container .router-link-exact-active.router-link-active {
  @apply text-primary;
  transition: ease-in-out;
  transition-duration: 200ms;
  font-weight: 600;
  background-color: #F6F6F6;
}

#popup-header input {
  background-color: #F6F6F6;
  height: 36px;
  border-radius: 42px;
  border: 1px solid #E8E8E9;
}
</style>

