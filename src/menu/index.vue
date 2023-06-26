<template>
  <div class="h-full">
    <MenuHeader
      :tab="currentTab"
      :fill-type="currentFillType"
      :tabs="tabs"
    />
    <MenuSearch
      v-if="tab === 2 && !isLocked"
      :fill-types="fillTypes"
      :fill-type="currentFillType"
      @change="(v) => fillType = v"
    />
    <div class="menu-info" :class="{ 'is-search': tab === 2 }">
      <PasswordGenerator
        v-if="tab === 1"
        is-over
      />
      <MenuCiphers
        v-else-if="tab === 2 && !isLocked"
        :fill-types="fillTypes"
        :fill-type="currentFillType"
      />
      <MenuLocked
        v-else-if="tab === 2 && isLocked"
      />
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import MenuHeader from './components/Header.vue';
import MenuSearch from './components/Search.vue';
import MenuCiphers from './components/Ciphers.vue';
import MenuLocked from './components/Locked.vue';
import PasswordGenerator from '@/popup/components/password/PasswordGenerator.vue'
import { CipherType } from "jslib-common/enums/cipherType";
import { BrowserApi } from "@/browser/browserApi";

export default Vue.extend({
  name: 'Menu',
  components: {
    MenuHeader,
    MenuSearch,
    MenuCiphers,
    MenuLocked,
    PasswordGenerator
  },
  data () {
    return {
      tab: this.$route.query?.generate == 1 ? 1 : 2,
      fillType: 0
    }
  },
  asyncComputed: {
    savedDomains: {
      async get () {
        const domains = await this.$storageService.get('neverDomains') || {}
        return Object.keys(domains) || []
      },
      watch: []
    },
    excludeDomain: {
      async get () {
        const currentUrlTab = await BrowserApi.getTabFromCurrentWindow();
        return !!(this.savedDomains || []).find((d) => currentUrlTab.url.includes(d))
      },
      watch: []
    },
    isLocked: {
      async get () {
        return await this.$vaultTimeoutService.isLocked()
      },
      watch: []
    }
  },
  computed: {
    tabs() {
      return [
        {
          value: 1,
          name: this.$t('menu.generate_password'),
          onclick: () => { this.tab = 1 }
        },
        {
          value: 2,
          name: this.$t('menu.fill_something_else'),
          disabled: this.isLocked,
          onclick: () => { this.tab = 2 }
        },
        {
          value: 3,
          name: this.$t('menu.turn_off'),
          class: 'text-danger',
          divided: true,
          disabled: this.isLocked,
          onclick: () => {
            //
          }
        },
      ]
    },
    fillTypes() {
      return [
        {
          value: 0,
          name: this.$t('data.home.for_current'),
          title: this.$t('menu.saved_login'),
          empty: this.$t('data.home.no_for_current'),
        },
        {
          value: CipherType.Login,
          name: this.$t('common.password'),
          title: this.$t('menu.saved_login'),
          empty: this.$t('menu.empty_password'),
        },
        {
          value: CipherType.Card,
          name: this.$t('common.payment_card'),
          title: this.$t('menu.saved_card'),
          empty: this.$t('menu.empty_card'),
        },
        {
          value: CipherType.Identity,
          name: this.$t('common.personal_information'),
          title: this.$t('menu.saved_identity'),
          empty: this.$t('menu.empty_identity'),
        }
      ]
    },
    currentTab() {
      return this.tabs.find((t) => t.value == this.tab)
    },
    currentFillType() {
      return this.fillTypes.find((t) => t.value == this.fillType)
    }
  },
  methods: {
  }
})
</script>

<style lang="scss">
.menu-info {
  height: calc(100% - 56px);
  overflow: auto;
  &.is-search {
    height: calc(100% - 56px - 48px);
  }
}
</style>
