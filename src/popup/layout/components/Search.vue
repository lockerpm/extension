<template>
  <div
    class="fixed flex items-center px-4 layout-filter"
    :class="{ 'is-detail': isDetail }"
    style="height: 64px"
  >
    <el-select
      v-if="['vault', 'folder-detail'].includes($route.name)"
      :value="cipherType"
      class="mr-2"
      style="width: 270px;"
      size="small"
      @change="(v) => changeCipherType(v)"
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
      v-else-if="['vault', 'folder-detail'].includes($route.name)"
      icon="el-icon-plus"
      circle
      type="primary"
      size="small"
      @click="addCipher"
    />
    <el-button
      v-else
      icon="el-icon-plus"
      circle
      type="primary"
      size="small"
      @click="() => addFolder()"
    />
    <AddEditFolder
      key="search-folders"
      ref="addEditFolder"
      @done="() => {}"
    />
    <AddEditOTP
      key="search-otp"
      ref="addEditOTP"
    />
  </div>
</template>

<script>
import { CipherType } from "jslib-common/enums/cipherType";
import { BrowserApi } from "@/browser/browserApi";
import AddEditFolder from '@/popup/components/folder/AddEditFolder'
import AddEditOTP from '@/popup/components/otp/AddEditOTP.vue'

export default {
  components: { AddEditFolder, AddEditOTP },
  props: {
    isDetail: {
      type: Boolean,
      default: false
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
    cipherType() {
      return this.$route.query ? Number(this.$route.query?.type || CipherType.Login) : CipherType.Login
    },
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
  watch: {
    $route: {
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      handler() {
        this.inputText = '';
        this.handleSearch()
      },
      deep: true
    }
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    changeCipherType(type) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      this.$router.replace({ name: this.$route.name, query: { type: type }, params: this.$route.params }).catch(() => {})
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    handleSearch () {
      this.$store.commit('UPDATE_SEARCH', this.inputText)
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    addCipher () {
      this.$router.push({
        name: 'add-edit-cipher',
        params: { type: this.cipherType, folder: this.$route.params?.data || null }
      }).catch(() => ({}))
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    addFolder () {
      this.$refs.addEditFolder?.openDialog({}, true)
    },
    
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async handleCreateOTP (command) {
      if (command === 'setup-key') {
        this.$refs.addEditOTP?.openDialog({})
      } else {
        this.scanQRCode()
      }
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
  &.is-detail {
    top: 60px !important;
  }
}
</style>

