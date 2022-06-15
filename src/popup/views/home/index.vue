<template>
  <div style="padding-top: 180px; padding-bottom: 56px;">
    <div
      v-if="!isLoggedIn"
      class="p-6"
    >
      <img
        src="@/assets/images/logo/logo_black.svg"
        alt="Locker"
        class="h-[50px] mx-auto"
      >
      <div class="my-5 text-center text-head-5">
        {{$t('data.home.title')}}
      </div>
      <div class="w-full max-w-[500px]">
        <button
          class="btn btn-primary w-full mb-4"
          @click="openLogin"
        >
          {{$t('data.home.login')}}
        </button>
        <button
          class="btn btn-default w-full mb-4"
          @click="openRegister"
        >
          {{$t('data.home.register')}}
        </button>
        <button
          class="btn btn-default w-full mb-4"
          @click="openVault"
        >
          {{$t('data.home.vault')}}
        </button>
      </div>
    </div>
    <div
      v-else
      class="p-4 text-[#A2A3A7]"
    >
      <!-- <template v-if="searchText.length>1">
        <ul class="list-ciphers">
          <cipher-row
            v-for="item in ciphers"
            :key="item.id"
            :item="item"
            @do-fill="fillCipher(item)"
          >
          </cipher-row>
        </ul>
      </template> -->
      <template>
        <!-- For current website -->
        <div v-if="searchText.length<2" class="mb-1">
          <div class="mb-4 font-semibold">{{$t('data.home.for_current')}}</div>
          <ul class="list-ciphers">
            <div
              v-if="!loginCiphers.length"
              class="bg-white py-2 px-5 cursor-pointer" style="border-radius: 12px"
              @click="goToAddItem"
            >
              <!-- <p class="mb-2">{{$t('data.home.no_for_current')}}</p> -->
              <!-- <router-link
                :to="{name: 'add-item-create'}"
                class="uppercase text-primary hover:no-underline"
              >
              {{$t('data.home.add_password')}}
              </router-link> -->
              <div class="flex">
                <!-- <img src="@/assets/images/icons/icon_default.svg"> -->
                <div
                  class="text-[34px] mr-3 flex-shrink-0"
                >
                  <Vnodes :vnodes="getCurrentSiteIcon()" />
                </div>
                
                <div class="ml-4 text-left">
                  <div class="text-head-6 text-black font-semibold">
                    {{$t('data.home.add_password')}}
                  </div>
                  <div class="text-[14px] text-black-500">
                    {{$t('data.home.no_for_current')}}
                  </div>
                </div>
              </div>
            </div>
            <cipher-row
              v-for="item in loginCiphers"
              :key="item.id"
              :item="item"
              @do-fill="fillCipher(item)"
            >
            </cipher-row>
          </ul>
        </div>

        <!-- All Passwords -->
        <ListCipher
          :filter="c => c.type === CipherType['Login']"
          route-name="home"
        />

        <!-- <div
          v-if="cardCiphers.length"
          class="mt-4 mb-1"
        >
          {{$tc('type.Card', 2)}} ({{cardCiphers.length}})
        </div>
        <ul class="list-ciphers">
          <cipher-row
            v-for="item in cardCiphers"
            :key="item.id"
            :item="item"
            @do-fill="fillCipher(item)"
          >
          </cipher-row>
        </ul>
        <div
          v-if="identityCiphers.length"
          class="mt-4 mb-1"
        >
          {{$tc('type.Identity', 2)}} ({{identityCiphers.length}})
        </div>
        <ul class="list-ciphers">
          <cipher-row
            v-for="item in identityCiphers"
            :key="item.id"
            :item="item"
            @do-fill="fillCipher(item)"
          >
          </cipher-row>
        </ul> -->
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { BrowserApi } from "@/browser/browserApi";
import { Utils } from "jslib-common/misc/utils";
import { CipherType } from "jslib-common/enums/cipherType";
import { ConstantsService } from "jslib-common/services/constants.service";
import BrowserStorageService from "@/services/browserStorage.service";
import { CipherView } from "jslib-common/models/view/cipherView";
import { CipherRepromptType } from "jslib-common/enums/cipherRepromptType";
import CipherRow from "@/popup/components/ciphers/CipherRow";
import ListCipher from "@/popup/components/ciphers/ListCipher";
import Vnodes from "@/components/Vnodes";
import { Avatar } from "element-ui";
import extractDomain from "extract-domain";
const BroadcasterSubscriptionId = "CurrentTabComponent";
export default Vue.extend({
  name: "Home",
  components: {
    CipherRow,
    ListCipher,
    Vnodes
  },
  data() {
    return {
      CipherType,
      step: 1,
      cardCiphers: [],
      identityCiphers: [],
      loginCiphers: [],
      url: "",
      pageDetails: [],
      hostname: "",
      inSidebar: false,
      searchTypeSearch: false,
      loaded: false,

      totpCode: "",
      totpTimeout: null,
      loadedTimeout: null,
      searchTimeout: null,
      loading: false,
    };
  },
  async mounted() {
    chrome.runtime.onMessage.addListener(
      (msg: any, sender: chrome.runtime.MessageSender, response: any) => {
        this.processMessage(msg, sender, response);
      }
    );
    // await this.load();
    if (!this.$syncService.syncInProgress) {
      await this.load();
    } else {
      this.loadedTimeout = window.setTimeout(async () => {
        if (!this.loaded) {
          await this.load();
        }
      }, 5000);
    }
  },
  destroyed() {
    window.clearTimeout(this.loadedTimeout);
  },
  // watch: {
  //   ciphers() {
  //     if (this.ciphers) {
  //       this.loading = false;
  //     }
  //     window.setTimeout(() => {
  //       this.load();
  //     }, 500);
  //   },
  // },
  // asyncComputed: {
  //   ciphers: {
  //     async get() {
  //       const deletedFilter = (c) => {
  //         return c.isDeleted === false;
  //       };
  //       const result =
  //         (await this.$searchService.searchCiphers(
  //           this.searchText,
  //           [null, deletedFilter],
  //           null
  //         )) || [];

  //       return (
  //         orderBy(
  //           result,
  //           [
  //             (c) =>
  //               this.orderField === "name"
  //                 ? c.name && c.name.toLowerCase()
  //                 : c.revisionDate,
  //           ],
  //           [this.orderDirection]
  //         ) || []
  //       );
  //     },
  //     watch: [
  //       "$store.state.syncedCiphersToggle",
  //       "deleted",
  //       "searchText",
  //       "filter",
  //       "orderField",
  //       "orderDirection",
  //     ],
  //   },
  // },
  methods: {
    openLogin() {
      // const url = `${
      //   process.env.VUE_APP_ID_URL
      // }/login?SERVICE_URL=${encodeURIComponent(
      //   "/sso"
      // )}&SERVICE_SCOPE=pwdmanager&CLIENT=browser`;
      // this.$platformUtilsService.launchUri(url);
      // BrowserApi.reloadOpenWindows();
      // const thisWindow = window.open("", "_self");
      // thisWindow.close();
      this.$router.push({ name: "login" });
    },
    openRegister() {
      const url = `${
        process.env.VUE_APP_ID_URL
      }/register?SERVICE_URL=${encodeURIComponent(
        "/sso"
      )}&SERVICE_SCOPE=pwdmanager&CLIENT=browser`;
      this.$platformUtilsService.launchUri(url);
    },
    openVault() {
      // this.$platformUtilsService.launchUri("/web.html#/vault");
      this.$platformUtilsService.launchUri("https://locker.io/vault");
    },
    openLock() {
      this.$router.push({ name: "lock" });
    },
    openSet() {
      this.$router.push({ name: "set-master-password" });
    },
    openRoute(item) {
      if (item.externalUrl) {
        this.$platformUtilsService.launchUri(item.externalUrl);
      } else {
        this.$router.push({ name: item.routeName });
      }
    },
    async load() {
      const tab = await BrowserApi.getTabFromCurrentWindow();
      if (tab != null) {
        this.url = tab.url;
      } else {
        this.loginCiphers = [];
        // this.loaded = true;
        return;
      }
      this.hostname = Utils.getHostname(this.url);
      this.pageDetails = [];
      // console.log("popup send cmd: collectPageDetails");
      BrowserApi.tabSendMessage(tab, {
        command: "collectPageDetails",
        tab: tab,
        sender: BroadcasterSubscriptionId,
      });

      const otherTypes: CipherType[] = [];
      const dontShowCards = await new BrowserStorageService().get<boolean>(
        ConstantsService.dontShowCardsCurrentTab
      );
      const dontShowIdentities = await new BrowserStorageService().get<boolean>(
        ConstantsService.dontShowIdentitiesCurrentTab
      );
      if (!dontShowCards) {
        otherTypes.push(CipherType.Card);
      }
      if (!dontShowIdentities) {
        otherTypes.push(CipherType.Identity);
      }

      const ciphers = await this.$cipherService.getAllDecryptedForUrl(
        this.url,
        otherTypes.length > 0 ? otherTypes : null
      );

      this.loginCiphers = [];
      this.cardCiphers = [];
      this.identityCiphers = [];

      ciphers.forEach((c) => {
        switch (c.type) {
        case CipherType.Login:
          this.loginCiphers.push(c);
          break;
        case CipherType.Card:
          this.cardCiphers.push(c);
          break;
        case CipherType.Identity:
          this.identityCiphers.push(c);
          break;
        default:
          break;
        }
      });

      this.loginCiphers = this.loginCiphers.sort((a, b) =>
        this.$cipherService.sortCiphersByLastUsedThenName(a, b)
      );
      this.loaded = true;
    },
    addEdit(item) {
      // this.$platformUtilsService.launchUri(`/web.html#/vault/${item.id}`);
      this.$router.push({ name: "add-item-create", params: { data: item } });
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
      // console.log(this.pageDetails)
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
        // this.notify(e, 'warning')
      }
    },
    async processMessage(msg: any, sender: any, sendResponse: any) {
      // console.log(
      //   `popup.home processMessage, sender: ${msg.sender}, cmd: ${msg.command}`
      // );
      switch (msg.command) {
      case "syncCompleted":
        // if (this.loaded) {
        //   window.setTimeout(() => {
        //     this.load();
        //   }, 500);
        // }
        window.setTimeout(() => {
          this.load();
        }, 500);
        break;
      case "collectPageDetailsResponse":
        // console.log("home: collectPageDetails");
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
    },
    goToAddItem () {
      this.$router.push({ name: "add-item-create"});
    },
    getCurrentSiteIcon() {
      try {
        const domain = extractDomain(
          this.url
        );
        if (domain) {
          return this.$createElement(
            Avatar,
            {
              props: {
                src: `${process.env.VUE_APP_LOGO_URL}${domain}?size=${34}`,
                size: 34,
                alt: domain,
                shape: "square"
              }
            },
            [
              this.$createElement("img", {
                attrs: {
                  src: require("@/assets/images/icons/icon_default.svg")
                }
              })
            ]
          );
        }
      } catch (e) {
        return this.$createElement('img', {
          attrs: {
            src: require(`@/assets/images/icons/icon_default.svg`),
            style: `height: 34px`,
            class: 'rounded mx-auto'
          }
        })
      }
    }
  },
});
</script>
