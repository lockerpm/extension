<template>
  <div class="list-otp">
    <NoCipher
      v-if="shouldRenderNoCipher && !$store.state.syncing"
      :type="CipherType.OTP"
      @add-cipher="() => {}"
    />
    <div
      v-else
      class="list-otp__container"
      v-loading="callingAPI"
    >
      <SortMenu
        :ciphers="dataRendered"
        :label="$t('data.parts.otp')"
        :order-field="orderField"
        :order-direction="orderDirection"
        @sort="changeSort"
      />
      <div class="list-ciphers">
        <OTPRow
          v-for="item in dataRendered"
          :key="item.id"
          :item="item"
          @edit-otp="() => $emit('edit-otp', item)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import orderBy from "lodash/orderBy";
import OTPRow from './OTPRow.vue';

import { CipherType } from "jslib-common/enums/cipherType";
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
      CipherType,
      otps: [],
      orderField: "revisionDate",
      orderDirection: 'desc',
      callingAPI: false,
      renderIndex: 0,
      dataRendered: []
    }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  mounted() {
    self.onscroll = () => {
      const bottomOfWindow =
        Math.max(
          self.pageYOffset,
          document.documentElement.scrollTop,
          document.body.scrollTop
        ) +
          self.innerHeight +
          500 >=
        document.documentElement.scrollHeight;

      if (bottomOfWindow) {
        this.renderIndex += 50;
        if ( this.ciphers && this.renderIndex <= this.ciphers.length) {
          this.dataRendered = this.dataRendered.concat(
            this.ciphers.slice(this.renderIndex, this.renderIndex + 50)
          );
        }
      }
    };
  },
  asyncComputed: {
    ciphers: {
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      async get() {
        let result = (await this.$searchService.searchCiphers(
          this.searchText,
          [(c) => !c.deleted && c.type == CipherType.OTP],
          null
        )) || [];
        result = orderBy(result, [c => this.orderField === 'name' ? (c.name && c.name.toLowerCase()) : c.revisionDate], [this.orderDirection]) || []
        this.dataRendered = result.slice(0, 50);
        this.renderIndex = 0;
        return result || []
      },
      watch: [
        "$store.state.syncedCiphersToggle",
        "orderField",
        "orderDirection",
        "searchText",
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
    }
  }
}
</script>
<style lang="scss">
</style>
