<template>
  <div
    class="flex items-center h-[52px] leading-[44px] px-4 py-2"
  >
    <!-- <img
      src="@/assets/images/logo/logo.png"
      alt="Locker"
      class="h-[25px] mr-3"
      @click="$router.push('/')"
    > -->
    <el-select
      v-model="cipherType"
    >
      <el-option
        v-for="item in cipherTypes"
        :key="item.value"
        :label="$t(`sidebar.${item.name}`)"
        :value="item.value">
      </el-option>
    </el-select>
    <el-input
      v-model="inputText"
      :placeholder="$t('data.parts.search')"
      suffix-icon="el-icon-search"
      @input="handleSearch"
    >
    </el-input>
    <div
      style="margin-left: 12px; display: flex;"
      @click="$router.push({ name: 'add-edit-cipher', params: { type } })"
    >
      <i class="el-icon-plus text-primary text-head-5 font-semibold"></i>
    </div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import { CipherType } from "jslib-common/enums/cipherType";

export default {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data() {
    return {
      inputText: '',
      cipherType: CipherType.Login
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
    }, 100),
  },
  computed: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    cipherTypes() {
      return [
        {
          value: CipherType.Login,
          name: 'passwords'
        },
        {
          value: CipherType.SecureNote,
          name: 'notes'
        },
        {
          value: CipherType.Card,
          name: 'cards'
        },
        {
          value: CipherType.Identity,
          name: 'identities'
        },
        {
          value: CipherType.CryptoBackup,
          name: 'crypto-backups'
        },
      ]
    },
  }
}
</script>

<style lang="scss">
</style>

