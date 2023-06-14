<template>
  <div class="mb-4">
    <div class="mb-2 font-semibold text-[#A2A3A7]">
      {{$t('data.home.for_current')}} ({{ loginCiphers.length }})
    </div>
    <ul class="list-ciphers">
      <div
        v-if="!loginCiphers.length"
        class="bg-white py-2 px-5 cursor-pointer hover:bg-black-300"
        style="border-radius: 12px"
        @click="goToAddItem"
      >
        <div class="flex">
          <div
            class="text-[34px] mr-3 flex-shrink-0 "
          >
            <Vnodes
              :vnodes="getCurrentSiteIcon()"
            />
          </div>
          
          <div class="text-left">
            <div class="text-head-6 text-black font-semibold">
              {{$t('data.home.add_password')}}
            </div>
            <div class="text-[14px] text-black-500">
              {{$t('data.home.no_for_current')}}
            </div>
          </div>
        </div>
      </div>
      <CipherRow
        v-for="item in loginCiphers"
        :key="item.id"
        :item="item"
        @do-fill="$emit('do-fill', item)"
      />
    </ul>
  </div>
</template>

<script>
import Vue from "vue";
import Vnodes from "@/popup/components/Vnodes.vue";
import CipherRow from "@/popup/components/ciphers/CipherRow.vue";
import BrowserStorageService from "@/services/browserStorage.service";
import extractDomain from "extract-domain";

import { Avatar } from "element-ui";
import { BrowserApi } from "@/browser/browserApi";
import { CipherType } from "jslib-common/enums/cipherType";
import { ConstantsService } from "jslib-common/services/constants.service";

const BroadcasterSubscriptionId = "CurrentTabComponent";

export default Vue.extend({
  name: "LoginCiphers",
  components: {
    CipherRow,
    Vnodes,
  },
  data() {
    return {
      CipherType,
      loginCiphers: [],
      url: "",
      pageDetails: [],
      loaded: false,

      totpCode: "",
      totpTimeout: null,
      loadedTimeout: null,
    };
  },
  watch: {
    "$store.state.syncedCiphersToggle": 'load'
  },
  async mounted() {
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
          }
          break;
        default:
          break;
        }
        response();
      }
    );
    await this.load();
  },
  destroyed() {
    self.clearTimeout(this.loadedTimeout);
  },
  methods: {
    async load() {
      const tab = await BrowserApi.getTabFromCurrentWindow();
      if (tab != null) {
        this.url = tab.url;
      } else {
        this.loginCiphers = [];
        return;
      }
      this.pageDetails = [];

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

      ciphers.forEach((c) => {
        switch (c.type) {
        case CipherType.Login:
          this.loginCiphers.push(c);
          break;
        default:
          break;
        }
      });

      this.loginCiphers = this.$cipherService.sortCiphers(this.loginCiphers);
      this.loaded = true;
    },
    goToAddItem () {
      this.$router.push({ name: "add-edit-cipher"});
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
</style>