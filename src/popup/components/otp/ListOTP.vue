<template>
  <div class="list-otp">
    <el-input
      v-model="textSearch"
      class="list-otp__search"
      prefix-icon="el-icon-search"
      :placeholder="$t('data.parts.search')"
    >
    </el-input>
    <div class="list-otp__container" v-loading="callingAPI || loading">
      <el-row
        class="list-otp__container--sort p-4"
        type="flex"
        justify="space-between"
      >
        <span>{{ $t('data.ciphers.sort_by') }}: <b>{{ currentSort.label }}</b></span>
        <div class="right-icon">
          <el-dropdown trigger="click">
            <i class="el-icon-more"></i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-for="item in sortBy"
                :key="item.index"
                @click.native="changeSort(item.value)"
              >{{ item.label }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-row>
      <OTPRow
        v-for="item in ciphers"
        :key="item.id"
        :item="item"
        @edit="$emit('add-edit', item)"
        @delete="deleteOTPs"
      />
    </div>
    <div class="list-otp__add">
      <el-dropdown @command="handleCreateOTP" trigger="click">
        <div class="icon flex items-center justify-center">
          <i class="el-icon-plus"></i>
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="scan-qr">{{ $t('data.otp.scan_qr') }}</el-dropdown-item>
          <el-dropdown-item command="setup-key">{{ $t('data.otp.setup_key') }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import orderBy from "lodash/orderBy";
import { CipherType } from "jslib-common/enums/cipherType";
import { BrowserApi } from "@/browser/browserApi";
import OTPRow from './OTPRow.vue'

export default {
  name: 'ListOTP',
  components: { OTPRow },
  data () {
    return {
      otps: [],
      loading: false,
      textSearch: '',
      orderField: "revisionDate",
      orderDirection: 'desc',
      callingAPI: false,
    }
  },
  asyncComputed: {
    ciphers: {
      async get() {
        this.loading = true;
        let result = await this.$cipherService.getAllDecrypted();
        result = result.filter((c) => !c.deleted && c.type === CipherType.OTP)
        result = result.filter((c) => c.name.toLowerCase().includes(this.textSearch.toLowerCase()))
        result = orderBy(result, [c => this.orderField === 'name' ? (c.name && c.name.toLowerCase()) : c.revisionDate], [this.orderDirection]) || []
        this.dataRendered = result.slice(0, 50);
        this.renderIndex = 0;
        this.loading = false;
        return result
      },
      watch: [
        "$store.state.syncedCiphersToggle",
        "orderField",
        "orderDirection",
        "textSearch",
      ],
    },
  },
  computed: {
    sortBy () {
      return [
        {
          label: this.$t('sort.name_asc'),
          value: 'name_asc'
        },
        {
          label: this.$t('sort.name_desc'),
          value: 'name_desc'
        },
        {
          label: this.$t('sort.time_asc'),
          value: 'revisionDate_asc'
        },
        {
          label: this.$t('sort.time_desc'),
          value: 'revisionDate_desc'
        }
      ]
    },
    currentSort () {
      const key = `${this.orderField}_${this.orderDirection}`
      return this.sortBy.find((s) => s.value === key) || this.sortBy[0]
    },
  },
  methods: {
    handleCreateOTP (command) {
      if (command === 'setup-key') {
        this.$emit('add-edit');
      } else {
        this.scanQRCode();
      }
    },
    changeSort (sortValue) {
      if (sortValue === 'custom') {
        return;
      }
      this.orderField = sortValue.split('_')[0];
      this.orderDirection = sortValue.split('_')[1];
    },
    async deleteOTPs (ids) {
      this.$confirm(this.$tc('data.notifications.delete_selected_desc', ids.length), this.$t('common.warning'), {
        confirmButtonText: this.$t('common.delete'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(async () => {
        try {
          this.callingAPI = true
          await this.axios.put('cystack_platform/pm/ciphers/permanent_delete', { ids })
          this.notify(this.$tc('data.notifications.delete_success', ids.length, { type: this.$t('type.5', ids.length) }), 'success')
          this.callingAPI = false
        } catch (e) {
          this.notify(this.$tc('data.notifications.delete_failed', ids.length, { type: this.$tc('type.5', ids.length) }), 'warning')
        } finally {
          this.callingAPI = false
        }
      })
    },
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
.list-otp {
  position: relative;
  &__search {
    position: fixed;
    top: 98px !important;
    left: 0;
    width: 100%;
    z-index: 1;
    .el-input {
      &__inner {
        border-left: none;
        border-right: none;
        border-radius: 0 !important;
        &:focus {
          border-color: #E6E6E8 !important;
        }
      }
    }
  }
  &__container {
    position: absolute;
    top: 40px;
    left: 0;
    width: 100%;
    z-index: 0;
    padding-bottom: 64px;
    .right-icon {
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      i {
        cursor: pointer;
        font-size: 20px;
        color: #6F6F6F;
      }
    }
  }
  &__add {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 3;
    .icon {
      width: 40px;
      height: 40px;
      background-color: #268334;
      border-radius: 50%;
      cursor: pointer;
    }
    
    i {
      font-size: 28px;
      color: #fff;
    }
  }
}
</style>
