<template>
  <div class="vault-body">
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
              <div class="flex">
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
      </template>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { BrowserApi } from "@/browser/browserApi";
import { Utils } from "jslib-common/misc/utils";
import { CipherType } from "jslib-common/enums/cipherType";
import { ConstantsService } from "jslib-common/services/constants.service";
import BrowserStorageService from "@/services/browserStorage.service";
import { CipherRepromptType } from "jslib-common/enums/cipherRepromptType";
import CipherRow from "@/popup/components/ciphers/CipherRow.vue";
import ListCipher from "@/popup/components/ciphers/ListCipher.vue";
import Vnodes from "@/popup/components/Vnodes.vue";
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
  watch: {
    "$store.state.syncedCiphersToggle": 'load'
  },
  async mounted() {
    chrome.runtime.onMessage.addListener(
      (msg, sender, response) => {
        this.processMessage(msg, sender, response);
      }
    );
    await this.load();
  },
  destroyed() {
    self.clearTimeout(this.loadedTimeout);
  },
  methods: {
    openLogin() {
      this.$router.push({ name: "login" });
    },
    openRegister() {
      this.$runtimeBackground.authAccessToken('register')
    },
    openVault() {
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
        return;
      }
      this.hostname = Utils.getHostname(this.url);
      this.pageDetails = [];
      BrowserApi.tabSendMessage(tab, {
        command: "collectPageDetails",
        tab: tab,
        sender: BroadcasterSubscriptionId,
      });

      const otherTypes = [];
      const dontShowCards = await new BrowserStorageService().get(
        ConstantsService.dontShowCardsCurrentTab
      );
      const dontShowIdentities = await new BrowserStorageService().get(
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

      this.loginCiphers = this.$cipherService.sortCiphers(this.loginCiphers);
      this.loaded = true;
    },
    addEdit(item) {
      this.$router.push({ name: "add-item-create", params: { data: item } });
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
            setTimeout(() => BrowserApi.closePopup(self), 50);
          }
        }
      } catch (e) {
        this.notify(this.$t("errors.autofill"), "error");
      }
    },
    async processMessage(msg, sender) {
      switch (msg.command) {
      case "syncCompleted":
        if (msg.successfully && msg.trigger) {
          this.notify("Syncing complete", "success");
        }
        self.setTimeout(() => {
          this.load();
        }, 500);
        break;
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
        return this.$createElement('img', {
          attrs: {
            src: require(`@/assets/images/icons/icon_default.svg`),
            style: `height: 34px`,
            class: 'rounded mx-auto'
          }
        })
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
<style>
.el-loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>