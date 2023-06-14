<template>
  <div
    class="fixed flex items-center px-4 layout-filter"
    style="height: 64px"
  >
    <el-select
      v-if="['vault'].includes($route.name)"
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
      suffix-icon="el-icon-search"
      class="mr-2"
      size="small"
      :placeholder="$t('data.parts.search')"
      @input="handleSearch"
    >
    </el-input>
    <el-dropdown
      v-if="['otp'].includes($route.name)"
      @command="handleCreateOTP"
      trigger="click"
    >
      <el-button
        icon="el-icon-plus"
        circle
        type="primary"
        size="small"
      />
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="scan-qr">{{ $t('data.otp.scan_qr') }}</el-dropdown-item>
          <el-dropdown-item command="setup-key">{{ $t('data.otp.setup_key') }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    <el-button
      v-else-if="['vault'].includes($route.name)"
      icon="el-icon-plus"
      circle
      type="primary"
      size="small"
      @click="$router.push({ name: 'add-edit-cipher', params: { type: cipherType } })"
    />
    <el-button
      v-else
      icon="el-icon-plus"
      circle
      type="primary"
      size="small"
      @click="$router.push({ name: 'add-edit-folder' })"
    />
    
  </div>
</template>

<script>
import { CipherType } from "jslib-common/enums/cipherType";
import { BrowserApi } from "@/browser/browserApi";

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
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    handleSearch () {
      this.$store.commit('UPDATE_SEARCH', this.inputText)
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    handleCreateOTP (command) {
      if (command === 'setup-key') {
        this.$emit('add-edit');
      } else {
        this.scanQRCode();
      }
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async scanQRCode () {
      const tab = await BrowserApi.getTabFromCurrentWindow();
      if (tab) {
        BrowserApi.tabSendMessage(tab, {
          command: "scanQRCode",
          tab: tab,
          sender: 'scanQRCode',
        });  
      }
    }
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

