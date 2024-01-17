<template>
  <div class="list-otp">
    <NoCipher
      v-if="shouldRenderNoCipher && !$store.state.syncing"
      :type="CipherType.OTP"
<<<<<<< HEAD
      @add-cipher="() => {}"
=======
      @add-cipher="() => $emit('add-edit', null)"
>>>>>>> 14b511eab4334eebb6d6a34cf90b8ee7415766df
    />
    <div
      v-else
      class="list-otp__container"
      v-loading="callingAPI"
    >
      <SortMenu
        :ciphers="ciphers || []"
        :label="$t('data.parts.otp')"
        :order-field="orderField"
        :order-direction="orderDirection"
        @sort="changeSort"
      />
      <div class="list-ciphers">
        <OTPRow
<<<<<<< HEAD
          v-for="item in ciphers || []"
          :key="item.id"
          :item="item"
          @edit-otp="() => $emit('edit-otp', item)"
=======
          v-for="item in pagingCiphers || []"
          :key="item.id"
          :item="item"
          @edit-otp="() => $emit('add-edit', item)"
>>>>>>> 14b511eab4334eebb6d6a34cf90b8ee7415766df
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
      pageSize: 10,
      size: 10
    }
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
      if (this.ciphers) {
        return !this.ciphers.length;
      }
      return false
<<<<<<< HEAD
=======
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    pagingCiphers() {
      if (this.ciphers) {
        return this.ciphers.slice(0, this.size)
      }
      return []
>>>>>>> 14b511eab4334eebb6d6a34cf90b8ee7415766df
    },
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  mounted () {
    const mainBody = document.querySelector('.main-body')
    if (mainBody) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this
      mainBody.addEventListener('scrollend', () => {
        if (self.ciphers && self.ciphers.length > self.size) {
          self.size = self.pageSize + self.size
        }
      })
    }
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
