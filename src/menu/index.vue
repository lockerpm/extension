<template>
  <div class="h-full">
    <MenuHeader
      :tab="currentTab"
      :fill-type="currentFillType"
      :tabs="tabs"
      :excluded="excluded"
    />
    <div
      v-if="!excluded"
      style="height: calc(100% - 56px)"
    >
      <MenuSearch
        v-if="tab === 2 && !isLocked && !isOTP"
        :fill-types="fillTypes.filter((t) => t.value !== CipherType.OTP)"
        :fill-type="currentFillType"
        @change="(v) => fillType = v"
      />
      <div class="menu-info" :class="{ 'is-search': tab === 2 && !isLocked && !isOTP}">
        <PasswordGenerator
          v-if="tab === 1 && !isOTP"
          is-over
        />
        <MenuCiphers
          v-else-if="tab === 2 && !isLocked"
          :fill-type="currentFillType"
        />
        <MenuLocked
          v-else-if="tab === 2 && isLocked"
        />
      </div>
    </div>
    <MenuExcluded
      v-else
      @remove="() => removeDomain(excluded)"
    />
  </div>
</template>

<script>
import Vue from 'vue';
import MenuHeader from './components/Header.vue';
import MenuSearch from './components/Search.vue';
import MenuCiphers from './components/Ciphers.vue';
import MenuLocked from './components/Locked.vue';
import MenuExcluded from './components/Excluded.vue';

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
    MenuExcluded,
    PasswordGenerator
  },
  data () {
    return {
      CipherType,
      tab: Number(this.$route.query?.tab || 2),
      fillType: Number(this.$route.query?.type || 0),
    }
  },
  asyncComputed: {
    savedDomains: {
      async get () {
        return await this.$storageService.get('neverDomains') || {}
      },
      watch: [
        '$store.state.syncedExcludeDomains'
      ]
    },
    excluded: {
      async get () {
        const currentUrlTab = await BrowserApi.getTabFromCurrentWindow();
        return await this.$cipherService.getIncludedDomainByUrl(currentUrlTab.url)
      },
      watch: [
        '$store.state.syncedExcludeDomains'
      ]
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
          disabled: this.isOTP,
          onclick: () => { this.tab = 1 }
        },
        {
          value: 2,
          name: this.$t('menu.fill_something_else'),
          onclick: () => { this.tab = 2 }
        },
        {
          value: 3,
          name: this.$t('menu.turn_off'),
          class: 'text-danger',
          divided: true,
          disabled: this.isLocked,
          onclick: async () => {
            const currentUrlTab = await BrowserApi.getTabFromCurrentWindow();
            this.addExcludeDomain(currentUrlTab.url)
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
        },
        {
          value: CipherType.OTP,
          name: this.$t('common.otp'),
          title: this.$t('menu.saved_otp'),
          empty: this.$t('menu.empty_otp'),
        }
      ]
    },
    currentTab() {
      return this.tabs.find((t) => t.value == this.tab)
    },
    currentFillType() {
      return this.fillTypes.find((t) => t.value == this.fillType)
    },
    isOTP () {
      return this.currentFillType.value === CipherType.OTP
    },
  },
  methods: {
  }
})
</script>

<style lang="scss">
.menu-info {
  height: 100%;
  overflow: auto;
  &.is-search {
    height: calc(100% - 48px);
  }
}
</style>
