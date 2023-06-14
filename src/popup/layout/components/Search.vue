<template>
  <div
    class="fixed flex items-center px-4 layout-filter"
    style="height: 64px"
  >
    <el-select
      v-if="['home'].includes($route.name)"
      v-model="cipherType"
      class="mr-2"
      style="width: 270px;"
      size="small"
      @change="(v) => $emit('change', v)"
    >
      <el-option
        v-for="item in cipherTypes"
        :key="item.value"
        :label="$t(`sidebar.${item.name}`)"
        :value="item.value"
      />
    </el-select>
    <el-input
      v-model="inputText"
      :placeholder="$t('data.parts.search')"
      suffix-icon="el-icon-search"
      :class="!['otp'].includes($route.name) ? 'mr-2' : ''"
      size="small"
      @input="handleSearch"
    >
    </el-input>
    <el-button
      v-if="!['otp'].includes($route.name)"
      icon="el-icon-plus"
      circle
      type="primary"
      size="small"
      @click="$router.push({ name: 'add-edit-cipher', params: { type: cipherType } })"
    />
  </div>
</template>

<script>
import debounce from 'lodash/debounce'
import { CipherType } from "jslib-common/enums/cipherType";

export default {
  props: {
    cipherType: {
      type: Number,
      default: CipherType.Login
    }
  },
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
          name: 'cryptoBackups'
        },
      ]
    },
  }
}
</script>

<style lang="scss">
.layout-filter {
  z-index: 2000;
  top: 73px;
  left: 0;
  right: 0;
  .el-input {
    &__inner {
      border-radius: 12px !important;
      border: none !important;
    }
  }
}
</style>

