<template>
  <div
    id="popup-header"
    v-if="!locked && isLoggedIn && ['home', 'vault', 'settings', 'generator', 'cards', 'identities', 'notes', 'crypto-backups', 'folders'].includes(this.$route.name)"
    class="fixed top-0 bg-white cursor-pointer"
    style="z-index:1; width: 400px;"
  >
    <div class="h-auto grid grid-cols-3 bg-white navigator">
      <router-link
        :to="{name: item.routeName}"
        v-for="item in menu"
        :key="item.routeName"
        class="text-center text-[16px] navigator-item text-black"
      >
        <div class="navigator-item__image" v-html="item.icon">
          <!-- <i :class="`fas fa-${item.icon}`"></i> -->
          <!-- <img
            class="mx-auto navigator-item__image"
            :src="require(`@/assets/images/${item.image}`)"
          > -->
        </div>
        <div>
          {{item.label}}
        </div>
        <hr class="bg-primary mx-auto mt-2" style="width: 32px; height: 2px; opacity: 0;">
      </router-link>
    </div>
    <div
      v-if="['home', 'vault', 'cards', 'identities', 'notes', 'crypto-backups', 'folders'].includes(this.$route.name)"
      class="flex items-center h-[52px] leading-[44px] px-4 pb-4"
      style="border-bottom: 1px solid #C5C6C8"
    >
      <img
        src="@/assets/images/logo/logo.png"
        alt="Locker"
        class="h-[25px] mr-3"
        @click="$router.push('/')"
      >
      <el-input
        :placeholder="$t('data.parts.search')"
        suffix-icon="el-icon-search"
        v-model="inputText"
        @input="handleSearch"
      >
      </el-input>
      <div
        style="margin-left: 12px"
        @click="$router.push({ name: 'add-item-create', params: {  type } })"
      >
        <!-- <i class="fas fa-plus-circle hover:text-primary text-black-500 text-[20px]"></i> -->
        <img
          class="mt-3"
          src="@/assets/images/plus-circle.png"
        >
      </div>
    </div>
    <div
      v-if="['home', 'vault', 'cards', 'identities', 'notes', 'crypto-backups', 'folders'].includes(this.$route.name)"
      id="vault-slider"
      class="bg-white"
    >
      <div class="slider-container">
        <span
          id="arrow-left"
          class="px-4"
          @click="showPre()"
        ><i class="fas fa-angle-left"></i></span>
        <div
          class="catagories-container"
          style="width: 80%"
        >
          <ul class="catalog-list corporate-projects">
            <!-- <i id="prev1" class="fas fa-chevron-left move-left"></i> -->
            <li
              v-for="(item, index) in vault_categories"
              :key="index"
              class="catalog-item landing-transition text-12 font-weight-700 text-uppercase"
            >
              <router-link :to="{name: item.routeName}" class="text-black">
                {{ $t(`sidebar.${item.name}`) }}
              </router-link>
            </li>
            <!-- <i id="next1" class="fas fa-chevron-right move-right"></i> -->
          </ul>
        </div>
        <span
          class="px-4"
          @click="showNext()"
        ><i class="fas fa-angle-right"></i></span>
      </div>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
export default {
  data () {
    return {
      inputText: ''
    }
  },
  asyncComputed: {
    async locked () {
      return await this.$vaultTimeoutService.isLocked()
    }
  },
  methods: {
    handleSearch: debounce(function (e) {
      // console.log(e)
      this.$store.commit('UPDATE_SEARCH', this.inputText)
    }, 800),
    showPre () {
      const slider = document.querySelector('.catalog-list')
      const scrollLeft = slider.scrollLeft
      slider.scroll({
        left: scrollLeft - 150,
        behavior: 'smooth'
      })
    },
    showNext () {
      const slider = document.querySelector('.catalog-list')
      const scrollLeft = slider.scrollLeft
      slider.scroll({
        left: scrollLeft + 150,
        behavior: 'smooth'
      })
    },
  },
  computed: {
    type () {
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
    vault_categories () {
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
    menu () {
      return [
        {
          label: this.$t('data.parts.vault'),
          routeName: ['home', 'cards', 'notes', 'identities', 'crypto-backups', 'folders'].includes(this.$route.name) ? this.$route.name : 'home',
          icon: `<svg class="icon-highlight" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.5 8.25H4.5C4.08579 8.25 3.75 8.58579 3.75 9V19.5C3.75 19.9142 4.08579 20.25 4.5 20.25H19.5C19.9142 20.25 20.25 19.9142 20.25 19.5V9C20.25 8.58579 19.9142 8.25 19.5 8.25Z" stroke="#161922" stroke-width="1.53125" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M8.625 8.25V4.875C8.625 3.97989 8.98058 3.12145 9.61351 2.48851C10.2465 1.85558 11.1049 1.5 12 1.5C12.8951 1.5 13.7535 1.85558 14.3865 2.48851C15.0194 3.12145 15.375 3.97989 15.375 4.875V8.25" stroke="#161922" stroke-width="1.53125" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 15.375C12.6213 15.375 13.125 14.8713 13.125 14.25C13.125 13.6287 12.6213 13.125 12 13.125C11.3787 13.125 10.875 13.6287 10.875 14.25C10.875 14.8713 11.3787 15.375 12 15.375Z" fill="#161922"/>
                </svg>`,
          image: 'vault.png'
        },
        {
          label: this.$t('data.parts.generator'),
          routeName: 'generator',
          icon: `<svg class="icon-highlight" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.5188 9.34692H21.0188V4.84692" stroke="#161922" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M17.8311 17.8313C16.6776 18.9857 15.2076 19.7721 13.6071 20.091C12.0066 20.4099 10.3474 20.2469 8.83953 19.6227C7.33165 18.9984 6.04278 17.941 5.13596 16.5842C4.22914 15.2273 3.74512 13.632 3.74512 12C3.74512 10.368 4.22914 8.7727 5.13596 7.41585C6.04278 6.059 7.33165 5.00158 8.83953 4.37735C10.3474 3.75313 12.0066 3.59014 13.6071 3.90902C15.2076 4.22789 16.6776 5.0143 17.8311 6.16875L21.0186 9.34688" stroke="#161922" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M11.8875 9.75V12" stroke="#161922" stroke-width="1.125" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9.75 11.304L11.8875 12" stroke="#161922" stroke-width="1.125" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10.5657 13.8211L11.8875 12" stroke="#161922" stroke-width="1.125" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M13.2093 13.8211L11.8875 12" stroke="#161922" stroke-width="1.125" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14.025 11.304L11.8875 12" stroke="#161922" stroke-width="1.125" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`,
          image: 'generator.png'
        },
        {
          label: this.$t('data.parts.settings'),
          routeName: 'settings',
          icon: `<svg class="icon-highlight" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.2113 6.36103C21.1133 6.13208 20.9079 5.96675 20.6634 5.91976C20.4188 5.87278 20.1668 5.95028 19.9909 6.1266L16.3471 9.77906L14.5774 9.42262L14.221 7.6529L17.8734 4.00913C18.0498 3.83323 18.1273 3.58127 18.0803 3.33669C18.0333 3.0921 17.868 2.88679 17.639 2.78874C16.3465 2.23518 14.9132 2.09968 13.5399 2.40119C12.1665 2.70271 10.9218 3.42615 9.98002 4.47023C9.03825 5.51432 8.44656 6.82677 8.28779 8.22385C8.15232 9.41586 8.33778 10.6185 8.81966 11.7092L3.16621 16.5885C3.15233 16.6005 3.13889 16.613 3.12592 16.626C2.56258 17.1893 2.24609 17.9534 2.24609 18.75C2.24609 19.5467 2.56258 20.3108 3.12592 20.8741C3.68926 21.4375 4.45331 21.7539 5.25 21.7539C6.04668 21.7539 6.81074 21.4375 7.37408 20.8741C7.38705 20.8612 7.39954 20.8477 7.41152 20.8338L12.2909 15.1804C13.3815 15.6623 14.5842 15.8477 15.7762 15.7123C17.1733 15.5535 18.4857 14.9618 19.5298 14.02C20.5739 13.0782 21.2973 11.8336 21.5989 10.4602C21.9004 9.08683 21.7649 7.65355 21.2113 6.36103Z" stroke="#161922" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`,
          image: 'settings.png'
        }
      ]
    }
  }
}
</script>

<style lang="scss">
#popup-header .navigator-item__image {
      width: 64px;
    margin-left: auto;
    margin-right: auto;
  padding: 7.5px 0px;
  border-radius: 20px;
}
#popup-header .navigator-item:hover .navigator-item__image {
  transition: ease-in-out;
  transition-duration: 200ms;
  // background-color: #e4f0e6;
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
    // background-color: #e4f0e6;
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
  background-color: #E8E8E9;
} 
#popup-header input {
  background-color: #E8E8E9;
  height: 36px;
  border-radius: 42px;
  border: 0;
}
</style>

