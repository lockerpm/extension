<template>
  <div
    class="relative mx-auto"
  >
    <NoCipher
      v-if="shouldRenderNoCipher"
      @add-cipher="handleAddButton"
    />
    <div v-else>
      <div
        v-if="!['folder-detail'].includes(this.$route.name)"
        class="mb-2 font-semibold flex justify-between"
      >
        <div class="text-[#A2A3A7]">
          {{ $tc(`type.${type}`, 2) }} ({{ ciphers ? ciphers.length : 0 }})
        </div>
        <div class="flex items-center">
          <span v-if="orderString==='name_asc'">A-Z &nbsp;</span>
          <span v-if="orderString==='name_desc'">Z-A &nbsp;</span>
          <span v-if="orderString==='revisionDate_asc'">First Updated &nbsp;</span>
          <span v-if="orderString==='revisionDate_desc'">Last Updated &nbsp;</span>
          <el-dropdown trigger="click">
            <span class="el-dropdown-link">
              <img src="@/assets/images/icons/sort.svg">
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                class="flex items-center justify-between"
                @click.native="changeSort('name', 'asc')"
              >
                <span>{{ $t('data.ciphers.name') }} {{ $t('data.ciphers.ascending') }} &nbsp;</span>
                <i
                  v-if="orderString==='name_asc'"
                  class="fa fa-check"
                />
              </el-dropdown-item>
              <el-dropdown-item
                class="flex items-center justify-between"
                @click.native="changeSort('name', 'desc')"
              >
                <span>{{ $t('data.ciphers.name') }} {{ $t('data.ciphers.descending') }} &nbsp;</span>
                <i
                  v-if="orderString==='name_desc'"
                  class="fa fa-check"
                />
              </el-dropdown-item>
              <el-dropdown-item
                class="flex items-center justify-between"
                @click.native="changeSort('revisionDate', 'asc')"
              >
                <span>{{ $t('data.ciphers.time') }} {{ $t('data.ciphers.ascending') }} &nbsp;</span>
                <i
                  v-if="orderString==='revisionDate_asc'"
                  class="fa fa-check"
                />
              </el-dropdown-item>
              <el-dropdown-item
                class="flex items-center justify-between"
                @click.native="changeSort('revisionDate', 'desc')"
              >
                <span>{{ $t('data.ciphers.time') }} {{ $t('data.ciphers.descending') }} &nbsp;</span>
                <i
                  v-if="orderString==='revisionDate_desc'"
                  class="fa fa-check"
                />
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <ul class="list-ciphers">
        <cipher-row
          v-for="item in dataRendered"
          :key="item.id"
          :item="item"
          @do-fill="$emit('do-fill', item)"
        >
        </cipher-row>
      </ul>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import orderBy from "lodash/orderBy";
import NoCipher from "@/popup/components/ciphers/NoCipher";
import CipherRow from "@/popup/components/ciphers/CipherRow";
import { CipherType } from "jslib-common/enums/cipherType";

const BroadcasterSubscriptionId = "ChildViewComponent";

export default Vue.extend({
  components: {
    NoCipher,
    CipherRow,
  },
  props: {
    deleted: {
      type: Boolean,
      default: false,
    },
    type: {
      type: Number,
      default: 1,
    },
    folderId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      CipherType,
      dataRendered: [],
      renderIndex: 0,
      pageDetails: [],
      orderField: "revisionDate",
      orderDirection: "desc",
    };
  },
  async mounted() {
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
    chrome.runtime.onMessage.addListener(
      (msg, sender, response) => {
        switch (msg.command) {
        case "collectPageDetailsResponse":
          if (msg.sender === BroadcasterSubscriptionId) {
            const pageDetailsObj = {
              frameId: sender.frameId,
              tab: msg.tab,
              details: msg.details,
            };
            this.pageDetails.push(pageDetailsObj);
            response()
          }
          break;
        default:
          break;
        }
      }
    );
  },
  computed: {
    orderString() {
      return `${this.orderField}_${this.orderDirection}`;
    },
    shouldRenderNoCipher() {
      const filteredCiphers = this.ciphers || [];
      return !filteredCiphers.length;
    },
    cipherFilter() {
      if (this.folderId) {
        return (c) => c.folderId === this.folderId
      }
      if (this.type == CipherType.CryptoBackup) {
        return (c) => c.type ===  CipherType.CryptoAccount || c.type === CipherType.CryptoWallet
      }
      return (c) => c.type === this.type
    }
  },
  asyncComputed: {
    ciphers: {
      async get() {
        const deletedFilter = (c) => {
          return c.isDeleted === this.deleted;
        };
        let result =
          (await this.$searchService.searchCiphers(
            this.searchText,
            [this.cipherFilter, deletedFilter],
            null
          )) || [];
        // remove ciphers generated by authenticator
        result = result.filter((cipher) =>
          [
            CipherType.Login,
            CipherType.SecureNote,
            CipherType.Card,
            CipherType.Identity,
            CipherType.CryptoAccount,
            CipherType.CryptoWallet,
          ].includes(cipher.type)
        );
        result.map((item) => {
          if (item.type === CipherType.CryptoAccount) {
            try {
              item.cryptoAccount = JSON.parse(item.notes);
            // eslint-disable-next-line no-empty
            } catch (error) {}
          }
          if (item.type === CipherType.CryptoWallet) {
            try {
              item.cryptoWallet = JSON.parse(item.notes);
            // eslint-disable-next-line no-empty
            } catch (error) {}
          }
          return {
            ...item,
            checked: false,
          };
        });
        result = orderBy(result, [c => this.orderField === 'name' ? (c.name && c.name.toLowerCase()) : c.revisionDate], [this.orderDirection]) || []
        this.dataRendered = result.slice(0, 50);
        this.renderIndex = 0;
        return result
      },
      watch: [
        "$store.state.syncedCiphersToggle",
        "deleted",
        "searchText",
        "type",
        "orderField",
        "orderDirection",
      ],
    }
  },
  methods: {
    changeSort(orderField, orderDirection) {
      this.orderField = orderField;
      this.orderDirection = orderDirection;
    },
    handleAddButton() {
      this.$router.push({
        name: "add-edit-cipher",
        params: { type: this.type },
      });
    }
  },
});
</script>
