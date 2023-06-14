<template>
  <div class="list-otp">
    <NoCipher
      v-if="shouldRenderNoCipher && !$store.state.syncing"
      :type="CipherType.OTP"
      @add-cipher="() => {}"
    />
    <div
      class="list-otp__container"
      v-loading="callingAPI"
    >
      <SortMenu
        :ciphers="ciphers"
        :label="$t('data.parts.otp')"
        :order-field="orderField"
        :order-direction="orderDirection"
        @sort="changeSort"
      />
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
import NoCipher from "@/popup/components/ciphers/NoCipher";
import SortMenu from "@/components/SortMenu.vue";

export default {
  name: 'ListOTP',
  components: {
    SortMenu,
    OTPRow,
    NoCipher
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data () {
    return {
      otps: [],
      orderField: "revisionDate",
      orderDirection: 'desc',
      callingAPI: false,
    }
  },
  asyncComputed: {
    ciphers: {
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      async get() {
        let result = await this.$cipherService.getAllDecrypted();
        result = result.filter((c) => !c.deleted && c.type === CipherType.OTP)
        result = result.filter((c) => c.name.toLowerCase().includes(this.textSearch ? this.textSearch.toLowerCase() : ''))
        result = orderBy(result, [c => this.orderField === 'name' ? (c.name && c.name.toLowerCase()) : c.revisionDate], [this.orderDirection]) || []
        this.dataRendered = result.slice(0, 50);
        this.renderIndex = 0;
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
    shouldRenderNoCipher() {
      return !this.ciphers || !this.ciphers.length;
    },
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    changeSort (sortValue) {
      this.orderField = sortValue.orderField;
      this.orderDirection = sortValue.orderDirection;
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
</style>
