<template>
  <div
    v-loading="loading"
    class="relative mx-auto"
  >
    <NoCipher
      v-if="shouldRenderNoCipher"
      :type="type"
      @add-cipher="handleAddButton"
    />
    <div v-else>
      <div
        v-if="!['folders-folderId'].includes(this.$route.name)"
        class="mt-5 font-semibold mb-4 flex justify-between"
      >
        <div>{{ $tc(`type.${type}`, 2) }} ({{ ciphers ? ciphers.length : 0 }})</div>
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
          @do-fill="fillCipher(item)"
        >
        </cipher-row>
      </ul>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import orderBy from "lodash/orderBy";
import { CipherType } from "jslib-common/enums/cipherType";
import { BrowserApi } from "@/browser/browserApi";
const BroadcasterSubscriptionId = "ChildViewComponent";
import { CipherRepromptType } from "jslib-common/enums/cipherRepromptType";
import NoCipher from "@/popup/components/ciphers/NoCipher";
import CipherRow from "@/popup/components/ciphers/CipherRow";
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
    routeName: {
      type: String,
      default: "home",
    },
    filter: {
      type: Function,
      default: (c) => c.type === CipherType["Login"],
    },
  },
  data() {
    return {
      CipherType,
      loading: true,
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
  watch: {
    ciphers() {
      if (this.ciphers) {
        this.loading = false;
      }
    },
  },
  computed: {
    orderString() {
      return `${this.orderField}_${this.orderDirection}`;
    },
    type() {
      switch (this.routeName) {
      case "home":
        return "Login";
      case "notes":
        return "SecureNote";
      case "cards":
        return "Card";
      case "identities":
        return "Identity";
      case "crypto-backups":
        return "CryptoBackup";
      case "vault":
        return "Vault";
      case "shares":
        return "Shares";
      case "trash":
        return "Trash";
      default:
        return null;
      }
    },
    shouldRenderNoCipher() {
      const filteredCiphers = this.ciphers || [];
      return !filteredCiphers.length;
    },
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
            [this.filter, deletedFilter],
            null
          )) || [];
        // remove ciphers generated by authenticator
        result = result.filter((cipher) =>
          [
            CipherType.Login,
            CipherType.SecureNote,
            CipherType.Card,
            CipherType.Identity,
            6,
            7,
          ].includes(cipher.type)
        );
        result.map((item) => {
          if (item.type === 6) {
            try {
              item.cryptoAccount = JSON.parse(item.notes);
            // eslint-disable-next-line no-empty
            } catch (error) {}
          }
          if (item.type === 7) {
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
        "filter",
        "orderField",
        "orderDirection",
      ],
    },
    folders: {
      async get() {
        let folders = (await this.$folderService.getAllDecrypted()) || [];
        folders = folders.filter((f) => f.id);
        folders.forEach((f) => {
          const ciphers =
            this.ciphers &&
            (this.ciphers.filter((c) => c.folderId === f.id) || []);
          f.ciphersCount = ciphers && ciphers.length;
        });
        return folders;
      },
      watch: ["searchText", "orderField", "orderDirection", "ciphers"],
    },
  },
  methods: {
    changeSort(orderField, orderDirection) {
      this.orderField = orderField;
      this.orderDirection = orderDirection;
    },
    handleAddButton() {
      this.$router.push({
        name: "add-item-create",
        params: { type: this.type },
      });
    },
    async fillCipher(cipher) {
      if (
        cipher.reprompt !== CipherRepromptType.None &&
        !(await this.$passwordRepromptService.showPasswordPrompt())
      ) {
        return;
      }

      this.totpCode = null;
      if (this.totpTimeout != null) {
        self.clearTimeout(this.totpTimeout);
      }

      if (this.pageDetails == null || this.pageDetails.length === 0) {
        this.notify(this.$t("errors.autofill"), "error");
        return;
      }

      try {
        this.totpCode = await this.$autofillService.doAutoFill({
          cipher: cipher,
          pageDetails: this.pageDetails,
          fillNewPassword: true,
        });
        if (this.totpCode != null) {
          this.$platformUtilsService.copyToClipboard(this.totpCode, {
            window: self,
          });
        }
        if (this.$popupUtilsService.inPopup(self)) {
          if (
            this.$platformUtilsService.isFirefox() ||
            this.$platformUtilsService.isSafari()
          ) {
            BrowserApi.closePopup(self);
          } else {
            // Slight delay to fix bug in Chromium browsers where popup closes without copying totp to clipboard
            setTimeout(() => BrowserApi.closePopup(self), 50);
          }
        }
      } catch (e) {
        this.notify(this.$t("errors.autofill"), "error");
      }
    },
  },
});
</script>
