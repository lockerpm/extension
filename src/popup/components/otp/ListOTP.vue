<template>
  <div class="list-otp">
    <div
      class="list-otp__container"
      v-loading="callingAPI || loading"
    >
      <el-row
        class="list-otp__container--sort mb-2"
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
      <div class="list-ciphers">
        <OTPRow
          v-for="item in ciphers"
          :key="item.id"
          :item="item"
          @edit="$emit('add-edit', item)"
          @delete="deleteOTPs"
        />
      </div>
    </div>
  </div>
</template>

<script>
import orderBy from "lodash/orderBy";
import OTPRow from './OTPRow.vue';

import { CipherType } from "jslib-common/enums/cipherType";
import cystackPlatformAPI from '@/api/cystack_platform';

export default {
  name: 'ListOTP',
  components: { OTPRow },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    currentSort () {
      const key = `${this.orderField}_${this.orderDirection}`
      return this.sortBy.find((s) => s.value === key) || this.sortBy[0]
    },
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    changeSort (sortValue) {
      if (sortValue === 'custom') {
        return;
      }
      this.orderField = sortValue.split('_')[0];
      this.orderDirection = sortValue.split('_')[1];
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async deleteOTPs (ids) {
      this.$confirm(this.$tc('data.notifications.delete_selected_desc', ids.length), this.$t('common.warning'), {
        confirmButtonText: this.$t('common.delete'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(async () => {
        try {
          this.callingAPI = true
          await cystackPlatformAPI.ciphers_permanent_delete({ ids })
          this.notify(this.$tc('data.notifications.delete_success', ids.length, { type: this.$t('type.5', ids.length) }), 'success')
          this.callingAPI = false
        } catch (e) {
          this.notify(this.$tc('data.notifications.delete_failed', ids.length, { type: this.$tc('type.5', ids.length) }), 'warning')
        } finally {
          this.callingAPI = false
        }
      })
    }
  }
}
</script>
<style lang="scss">
.list-otp {
  z-index: 1;
  &__container {
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
}
</style>
