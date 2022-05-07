<template>
  <div
    id="popup-header"
    v-if="!locked && isLoggedIn && ['home', 'vault', 'settings', 'generator', 'cards', 'identities', 'notes', 'crypto-assets', 'folders'].includes(this.$route.name)"
    class="fixed top-0 bg-white cursor-pointer"
    style="z-index:1; width: 400px;"
  >
    <div class="h-auto grid grid-cols-3 bg-white navigator">
      <router-link
        :to="{name: item.routeName}"
        v-for="item in menu"
        :key="item.routeName"
        class="text-center text-[16px] navigator-item"
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
      </router-link>
    </div>
    <div
      v-if="['home', 'vault', 'cards', 'identities', 'notes', 'crypto-assets', 'folders'].includes(this.$route.name)"
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
      v-if="['home', 'vault', 'cards', 'identities', 'notes', 'crypto-assets', 'folders'].includes(this.$route.name)"
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
              <router-link :to="{name: item.routeName}">
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
      case "crypto-assets":
        return "CryptoAsset";
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
          name: 'cryptoAssets',
          routeName: 'crypto-assets'
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
          routeName: ['home', 'cards', 'notes', 'identities', 'crypto-assets', 'folders'].includes(this.$route.name) ? this.$route.name : 'home',
          // icon: 'popup_vault.svg'
          icon: `<svg width="19" height="20" viewBox="0 0 19 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="margin-left: auto; margin-right: auto">
                  <path d="M0.8125 8.01875V2.51562C0.8125 2.31671 0.891518 2.12595 1.03217 1.9853C1.17282 1.84464 1.36359 1.76562 1.5625 1.76562H16.5625C16.7614 1.76562 16.9522 1.84464 17.0928 1.9853C17.2335 2.12595 17.3125 2.31671 17.3125 2.51562V8.01875C17.3125 15.8937 10.6281 18.5 9.29688 18.9406C9.14564 18.9966 8.97936 18.9966 8.82812 18.9406C7.49688 18.5 0.8125 15.8937 0.8125 8.01875Z" stroke="#161922" stroke-width="1.55859" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M9.0625 6.26562V10.0156" stroke="#161922" stroke-width="1.55859" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M5.5 8.85303L9.0625 10.0155" stroke="#161922" stroke-width="1.55859" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M6.8595 13.0531L9.06262 10.0156" stroke="#161922" stroke-width="1.55859" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M11.2656 13.0531L9.0625 10.0156" stroke="#161922" stroke-width="1.55859" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M12.625 8.85303L9.0625 10.0155" stroke="#161922" stroke-width="1.55859" stroke-linecap="round" stroke-linejoin="round" />
                </svg>`
          ,
          image: 'vault.png'
        },
        {
          label: this.$t('data.parts.generator'),
          routeName: 'generator',
          // icon: 'popup_generate.svg'
          icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="margin-left: auto; margin-right: auto">
                  <path d="M3.75 5.25V18.75" stroke="#161922" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9.75 9V12" stroke="#161922" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M6.89996 11.0719L9.74996 12" stroke="#161922" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M7.98743 14.4281L9.74993 12" stroke="#161922" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M11.5125 14.4281L9.75 12" stroke="#161922" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12.6 11.0719L9.75 12" stroke="#161922" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18.75 9V12" stroke="#161922" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M15.9 11.0719L18.75 12" stroke="#161922" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16.9874 14.4281L18.7499 12" stroke="#161922" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M20.5125 14.4281L18.75 12" stroke="#161922" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21.6 11.0719L18.75 12" stroke="#161922" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`,
          image: 'generator.png'
        },
        {
          label: this.$t('data.parts.settings'),
          routeName: 'settings',
          // icon: 'popup_settings.svg'
          icon: `
            <svg width="23" height="23" viewBox="0 0 23 23" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="margin-left: auto; margin-right: auto">
              <path d="M20.7114 5.86103C20.6133 5.63208 20.408 5.46675 20.1634 5.41976C19.9188 5.37278 19.6669 5.45028 19.491 5.6266L15.8472 9.27906L14.0775 8.92262L13.721 7.1529L17.3735 3.50913C17.5498 3.33323 17.6273 3.08127 17.5803 2.83669C17.5334 2.5921 17.368 2.38679 17.1391 2.28874C15.8466 1.73518 14.4133 1.59968 13.0399 1.90119C11.6665 2.20271 10.4219 2.92615 9.48008 3.97023C8.53831 5.01432 7.94662 6.32677 7.78785 7.72385C7.65238 8.91586 7.83784 10.1185 8.31972 11.2092L2.66627 16.0885C2.65239 16.1005 2.63895 16.113 2.62598 16.126C2.06264 16.6893 1.74615 17.4534 1.74615 18.25C1.74615 19.0467 2.06264 19.8108 2.62598 20.3741L3.1501 19.85L2.62598 20.3741C3.18932 20.9375 3.95337 21.2539 4.75006 21.2539C5.54674 21.2539 6.3108 20.9375 6.87414 20.3741C6.88711 20.3612 6.8996 20.3477 6.91158 20.3338L11.7909 14.6804C12.8816 15.1623 14.0842 15.3477 15.2763 15.2123C16.6733 15.0535 17.9858 14.4618 19.0299 13.52C20.074 12.5783 20.7974 11.3336 21.0989 9.96019C21.4004 8.58683 21.2649 7.15355 20.7114 5.86103Z" stroke="#161922" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          `,
          image: 'settings.png'
        }
      ]
    }
  }
}
</script>

<style lang="scss">
#popup-header .navigator-item__image {
  padding: 7.5px 22.5px;
  border-radius: 20px;
}
#popup-header .navigator-item:hover .navigator-item__image {
  transition: ease-in-out;
  transition-duration: 200ms;
  background-color: #e4f0e6;
}
#popup-header .navigator {
  padding: 12.5px 0px;
}
a.navigator-item {
  @apply hover:no-underline;
}
#popup-header .navigator .navigator-item__image {
  color: white;
}
#popup-header .navigator .router-link-exact-active.router-link-active {
  font-weight: 600;
  .navigator-item__image {
    @apply text-primary-HOVER;
    transition: ease-in-out;
    transition-duration: 200ms;
    background-color: #e4f0e6;
  }
}
#popup-header .slider-container .router-link-exact-active.router-link-active {
  @apply text-primary;
  transition: ease-in-out;
  transition-duration: 200ms;
  font-weight: 600;
  background-color: #e4f0e6;
}
</style>

