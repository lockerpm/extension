<template>
  <div class="mb-4">
    <div class="mb-2 font-semibold text-gray">
      {{$t('data.home.for_current')}} ({{ loginCiphers ? loginCiphers.length : 0 }})
    </div>
    <ul class="list-ciphers">
      <li
        v-if="!loginCiphers || !loginCiphers.length"
        class="bg-white py-2 px-5 cursor-pointer"
        style="border-radius: 12px"
        @click="goToAddItem"
      >
        <div class="flex">
          <div
            class="text-[32px] mr-3 flex-shrink-0 "
          >
            <Vnodes
              :vnodes="getCurrentSiteIcon()"
            />
          </div>
          
          <div class="text-left">
            <div
              class="text-black font-semibold"
              style="line-height: 18px;"
            >
              {{$t('data.home.add_password')}}
            </div>
            <div
              class="truncate text-gray"
              style="line-height: 16px;"
            >
              {{$t('data.home.no_for_current')}}
            </div>
          </div>
        </div>
      </li>
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
      loaded: false,
    };
  },
  watch: {
    "$store.state.syncedCiphersToggle": 'load'
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
      ) || [];
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

      this.loginCiphers = this.$cipherService.sortCiphers(this.loginCiphers) || [];
      this.loaded = true;
    },
    goToAddItem () {
      this.$router.push({ name: "add-edit-cipher"}).catch(() => ({}));
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
                src: `${process.env.VUE_APP_LOGO_URL}${domain}?size=${32}`,
                size: 32,
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
            style: `height: 32px`,
            class: 'rounded mx-auto'
          }
        })
      } catch (e) {
        return this.$createElement('img', {
          attrs: {
            src: require(`@/assets/images/icons/icon_default.svg`),
            style: `height: 32px`,
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