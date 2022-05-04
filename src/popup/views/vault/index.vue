<template>
  <div
    class="relative mx-auto"
    style="background: #F1F1F1; padding-bottom: 56px; padding-top: 140px; min-height: 600px; max-width: 400px"
  >
    <Header></Header>
    <div id="vault-slider" class="bg-white">
      <div class="slider-container">
        <span
          id="arrow-left"
          @click="showPre()"
          style="padding: 0 10px 5px; cursor: pointer;"
        ><i class="fas fa-angle-left"></i></span>
        <div
          class="catagories-container"
          style="width: 80%"
        >
          <ul
            class="catalog-list corporate-projects"
          >
            <!-- <i id="prev1" class="fas fa-chevron-left move-left"></i> -->
            <li
              @click="changeCategory(item.id)"
              v-for="(item, index) in vault_categories"
              :key="index"
              class="catalog-item landing-transition text-12 font-weight-700 text-uppercase"
            >
              {{ item.name }}
            </li>
            <!-- <i id="next1" class="fas fa-chevron-right move-right"></i> -->
          </ul>
        </div>
        <span @click="showNext()" style="padding: 0 20px 5px; cursor: pointer"><i class="fas fa-angle-right"></i></span>
      </div>
    </div>
    <div v-loading="loading">
      <template v-if="searchText.length>1">
        <ul>
          <cipher-row
            v-for="item in dataRendered"
            :key="item.id"
            :item="item"
          >
          </cipher-row>
        </ul>
      </template>
      <ul
        v-else
        class=""
      >
        <div class="uppercase px-3 mt-4 mb-1">{{$t('common.type')}} ({{menu.length}})</div>
        <li
          v-for="(item, index) in menu"
          :key="index"
          class="flex items-center hover:bg-[#E4F2E1] hover:text-primary bg-white cursor-pointer h-[44px] leading-[44px] px-5 border-b border-black-400"
          @click="openRoute(item)"
        >
          <div
            class="menu-icon mr-4"
            style="padding-top: 4px"
          >
            <i
              class="fas text-[20px]"
              :class="[item.icon]"
            ></i>
          </div>
          <div class="flex-grow flex justify-between mr-2">
            <div>
              {{  item.label  }}
            </div>
            <div>
              {{ciphersCount[`${item.name}`]}} {{ $tc('type.Vault', ciphersCount[`${item.name}`])}}
            </div>
          </div>
          <div>
            <i class="fas fa-chevron-right"></i>
          </div>
        </li>
        <template v-if="folders">
          <div class="flex justify-between">
            <div class="uppercase px-3 mt-4 mb-1">{{$t('type.folder')}} ({{folders.length}})</div>
          </div>
          <li
            v-for="item in folders"
            :key="item.id"
            class="flex items-center hover:bg-[#E4F2E1] hover:text-primary bg-white cursor-pointer h-[44px] leading-[44px] px-5 border-b border-black-400"
            @click="routerFolder(item)"
          >
            <div class="menu-icon mr-4">
              <!-- <i class="fas fa-folder text-[20px]"></i> -->
              <img
                src="@/assets/images/icons/folder.svg"
                alt=""
                class=""
              >
            </div>
            <div class="flex-grow flex justify-between mr-2">
              <div class="w-[200px] truncate">
                {{ item.name }}
              </div>
              <div>
                {{ item.ciphersCount }} {{$tc('type.Vault', item.ciphersCount)}}
              </div>
            </div>
            <div>
              <i class="fas fa-chevron-right"></i>
            </div>
          </li>
        </template>
        <template
          v-for="(value, key) in filteredCollection"
          class="flex items-center hover:bg-[#E4F2E1] hover:text-primary bg-white cursor-pointer h-[44px] leading-[44px] px-5"
        >
          <div
            class="uppercase px-3 mt-4 mb-1"
            :key="key"
          >{{ getTeam(teams, key).name }}</div>
          <li
            v-for="item in value"
            :key="item.id"
            class="flex items-center hover:bg-[#E4F2E1] hover:text-primary bg-white cursor-pointer h-[44px] leading-[44px] px-5 border-b border-black-400"
            @click="routerCollection(item)"
          >
            <div class="menu-icon mr-4">
              <!-- <i class="fas fa-folder text-[20px]"></i> -->
              <img
                src="@/assets/images/icons/folder.svg"
                alt=""
                class=""
              >
            </div>
            <div class="flex-grow flex justify-between mr-2">
              <div class="w-[200px] truncate">
                {{item.name }}
              </div>
              <div>
                {{ item.ciphersCount }} {{$tc('type.Vault', item.ciphersCount)}}
              </div>
            </div>
            <div>
              <i class="fas fa-chevron-right"></i>
            </div>
          </li>
        </template>
        <div class="uppercase px-3 mt-4 mb-1">{{$t('type.no_folder')}} ({{noFolderCiphers.length}})</div>
        <cipher-row
          v-for="item in dataRendered"
          :key="item.id"
          :item="item"
          @do-fill="fillCipher(item)"
        >
        </cipher-row>

      </ul>
    </div>
    <Footer></Footer>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import orderBy from "lodash/orderBy";
import groupBy from "lodash/groupBy";
import { BrowserApi } from "@/browser/browserApi";
import { CipherType } from "jslib-common/enums/cipherType";
import CipherRow from "@/popup/components/ciphers/CipherRow";
import Header from "@/popup/components/layout/parts/Header";
import Footer from "@/popup/components/layout/parts/Footer";
const BroadcasterSubscriptionId = "ChildViewComponent";
import { CipherView } from "jslib-common/models/view/cipherView";
import { CipherRepromptType } from "jslib-common/enums/cipherRepromptType";
export default Vue.extend({
  components: {
    CipherRow,
    Header,
    Footer,
  },
  data() {
    return {
      CipherType,
      noFolderCiphers: [],
      loading: true,
      dataRendered: [],
      renderIndex: 0,
      pageDetails: [],
    };
  },
  async mounted() {
    window.onscroll = () => {
      const bottomOfWindow =
        Math.max(
          window.pageYOffset,
          document.documentElement.scrollTop,
          document.body.scrollTop
        ) +
          window.innerHeight +
          500 >=
        document.documentElement.scrollHeight;

      if (bottomOfWindow) {
        this.renderIndex += 50;
        if (
          this.searchText.length <= 1 &&
          this.renderIndex <= this.noFolderCiphers.length
        ) {
          this.dataRendered = this.dataRendered.concat(
            this.noFolderCiphers.slice(this.renderIndex, this.renderIndex + 50)
          );
        }
        if (
          this.searchText.length > 1 &&
          this.renderIndex <= this.ciphers.length
        ) {
          this.dataRendered = this.dataRendered.concat(
            this.ciphers.slice(this.renderIndex, this.renderIndex + 50)
          );
        }
      }
    };
    await this.loadPageDetails();
    chrome.runtime.onMessage.addListener(
      (msg: any, sender: chrome.runtime.MessageSender, response: any) => {
        switch (msg.command) {
        case "collectPageDetailsResponse":
          if (msg.sender === BroadcasterSubscriptionId) {
            const pageDetailsObj = {
              frameId: sender.frameId,
              tab: msg.tab,
              details: msg.details,
            };
            this.pageDetails.push(pageDetailsObj);
          }
          break;
        default:
          break;
        }
      }
    );
  },
  computed: {
    vault_categories () {
      return [
        {
          name: 'Password',
          routeName: ''
        },
        {
          name: 'Payment',
          routeName: ''
        },
        {
          name: 'Note',
          routeName: ''
        },
        {
          name: 'Card',
          routeName: ''
        }
      ]
    },
    menu() {
      return [
        {
          icon: "fa-key",
          routeName: "passwords",
          label: this.$tc("type.Login"),
          divided: false,
          name: "passwords",
        },
        {
          icon: "fa-sticky-note",
          routeName: "notes",
          label: this.$tc("type.SecureNote"),
          divided: false,
          name: "notes",
        },
        {
          icon: "fa-credit-card",
          routeName: "cards",
          label: this.$tc("type.Card"),
          divided: false,
          name: "cards",
        },
        {
          icon: "fa-id-card",
          routeName: "identities",
          label: this.$tc("type.Identity"),
          divided: false,
          name: "identities",
        },
        {
          icon: "fa-gem",
          routeName: "crypto-assets",
          label: this.$tc("type.CryptoAsset"),
          divided: false,
          name: "cryptoAssets",
        },
      ];
    },
    filteredCollection() {
      return groupBy(this.collections, "organizationId");
    },
    ciphersCount() {
      const passwords =
        this.ciphers &&
        (this.ciphers.filter((c) => c.type === CipherType.Login) || []);
      const passwordsCount = passwords && passwords.length;
      const notes =
        this.ciphers &&
        (this.ciphers.filter((c) => c.type === CipherType.SecureNote) || []);
      const notesCount = notes && notes.length;
      const cards =
        this.ciphers &&
        (this.ciphers.filter((c) => c.type === CipherType.Card) || []);
      const cardsCount = cards && cards.length;
      const identities =
        this.ciphers &&
        (this.ciphers.filter((c) => c.type === CipherType.Identity) || []);
      const identitiesCount = identities && identities.length;
      const cryptoAssets =
        this.ciphers &&
        (this.ciphers.filter((c) => c.type === 6 || c.type === 7) || []);
      const cryptoAssetsCount = cryptoAssets && cryptoAssets.length;
      return {
        passwords: passwordsCount,
        notes: notesCount,
        cards: cardsCount,
        identities: identitiesCount,
        cryptoAssets: cryptoAssetsCount,
      };
    },
  },
  watch: {
    ciphers() {
      if (this.ciphers) {
        this.loading = false;
      }
    },
  },
  asyncComputed: {
    ciphers: {
      async get() {
        const deletedFilter = (c) => {
          return c.isDeleted === false;
        };
        let result =
          (await this.$searchService.searchCiphers(
            this.searchText,
            [null, deletedFilter],
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
              // item.notes = item.cryptoAccount ? item.cryptoAccount.notes : ''
            } catch (error) {
              console.log(error);
            }
          }
          if (item.type === 7) {
            try {
              item.cryptoWallet = JSON.parse(item.notes);
              // item.notes = item.cryptoWallet ? item.cryptoWallet.notes : ''
            } catch (error) {
              console.log(error);
            }
          }
          return {
            ...item,
            checked: false,
          };
        });
        this.noFolderCiphers = result
          .filter((c) => c.folderId === null)
          .filter((c) => c.collectionIds && c.collectionIds.length === 0);
        this.dataRendered =
          this.searchText.length > 1
            ? result.slice(0, 50)
            : this.noFolderCiphers.slice(0, 50);
        this.renderIndex = 0;
        return (
          orderBy(
            result,
            [
              (c) =>
                this.orderField === "name"
                  ? c.name && c.name.toLowerCase()
                  : c.revisionDate,
            ],
            [this.orderDirection]
          ) || []
        );
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
    collections: {
      async get() {
        let collections =
          (await this.$collectionService.getAllDecrypted()) || [];
        collections = collections.filter((f) => f.id);
        collections.forEach((f) => {
          const ciphers =
            this.ciphers &&
            (this.ciphers.filter((c) => c.collectionIds.includes(f.id)) || []);
          f.ciphersCount = ciphers && ciphers.length;
        });
        if (!this.$store.state.syncing) {
          this.loading = false;
        }
        return collections;
      },
      watch: ["searchText", "orderField", "orderDirection", "ciphers"],
    },
  },
  methods: {
    openRoute(item) {
      if (item.externalUrl) {
        this.$platformUtilsService.launchUri(item.externalUrl);
      } else {
        this.$router.push({ name: item.routeName });
      }
    },
    async test() {
      const test = await BrowserApi.getTabFromCurrentWindow();
      console.log(test);
    },
    routerFolder(item) {
      this.$router.push({
        name: "vault-folders-folderId",
        params: { folderId: item.id },
      });
    },
    routerCollection(item) {
      if (item.id === "unassigned") {
        this.$router.push({
          name: "vault-teams-teamId-tfolders-tfolderId",
          params: { teamId: item.organizationId, tfolderId: item.id },
        });
      } else {
        this.$router.push({
          name: "vault-teams-teamId-tfolders-tfolderId",
          params: { teamId: item.organizationId, tfolderId: item.id },
        });
      }
    },
    addEdit(item) {
      this.$platformUtilsService.launchUri(`/web.html#/vault/${item.id}`);
    },
    async loadPageDetails() {
      this.pageDetails = [];
      this.tab = await BrowserApi.getTabFromCurrentWindow();
      if (this.tab == null) {
        return;
      }
      BrowserApi.tabSendMessage(this.tab, {
        command: "collectPageDetails",
        tab: this.tab,
        sender: BroadcasterSubscriptionId,
      });
    },
    async fillCipher(cipher: CipherView) {
      // console.log(this.pageDetails.length);
      if (
        cipher.reprompt !== CipherRepromptType.None &&
        !(await this.$passwordRepromptService.showPasswordPrompt())
      ) {
        return;
      }

      this.totpCode = null;
      if (this.totpTimeout != null) {
        window.clearTimeout(this.totpTimeout);
      }

      if (this.pageDetails == null || this.pageDetails.length === 0) {
        // this.toasterService.popAsync('error', null, this.$i18nService.t('autofillError'));
        this.notify(this.$t("errors.autofill"), "error");
        return;
      }

      try {
        this.totpCode = await this.$autofillService.doAutoFill({
          cipher: cipher,
          pageDetails: this.pageDetails,
          doc: window.document,
          fillNewPassword: true,
        });
        if (this.totpCode != null) {
          this.$platformUtilsService.copyToClipboard(this.totpCode, {
            window: window,
          });
        }
        if (this.$popupUtilsService.inPopup(window)) {
          if (
            this.$platformUtilsService.isFirefox() ||
            this.$platformUtilsService.isSafari()
          ) {
            BrowserApi.closePopup(window);
          } else {
            // Slight delay to fix bug in Chromium browsers where popup closes without copying totp to clipboard
            setTimeout(() => BrowserApi.closePopup(window), 50);
          }
        }
      } catch (e) {
        this.notify(this.$t("errors.autofill"), "error");
      }
    },
    showPre() {
      const slider = document.querySelector('.catalog-list')
      const scrollLeft = slider.scrollLeft
      slider.scroll({
        left: scrollLeft - 150,
        behavior: 'smooth'
      })
    },
    showNext() {
      const slider = document.querySelector('.catalog-list')
      const scrollLeft = slider.scrollLeft
      slider.scroll({
        left: scrollLeft + 150,
        behavior: 'smooth'
      })
    },
  },
});
</script>
