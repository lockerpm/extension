<template>
  <div class="">
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
        Log in or create a new account to access your secure vault.
      </div>
      <div class="w-full max-w-[500px]">
        <button
          class="btn btn-primary w-full mb-4"
          @click="openLogin"
        >
          Login
        </button>
        <button
          class="btn btn-default w-full mb-4"
          @click="openRegister"
        >
          Register
        </button>
        <button
          class="btn btn-default w-full mb-4"
          @click="openVault"
        >
          Vault
        </button>
      </div>
    </div>
    <div v-else>
      <div class="">
        <div class="flex items-center bg-black-300 cursor-pointer h-[44px] leading-[44px] px-5">
          <div class="menu-icon mr-4">
            <i class="fas fa-search text-[20px]"></i>
          </div>
          <el-input
            v-model="searchText"
            placeholder="Search vault"
            id="search"
          >
          </el-input>
        </div>
      </div>
      <ul v-if="searchText.length>1">
        <li
          v-for="item in ciphers" :key="item.id"
          class="flex items-center hover:bg-black-400 cursor-pointer h-[62px] px-5 border-t border-black-400"
        >
          <div class="flex-grow">
            <div class="text-black font-semibold truncate flex items-center">
              {{ item.name }}
            </div>
            <div>
              {{ item.subTitle }}
            </div>
          </div>
          <div>
            <div class="col-actions">
              <button
                v-if="item.login.canLaunch"
                class="btn btn-icon btn-xs hover:bg-black-400"
                :title="`Launch ${item.login.uri}`"
                @click="openNewTab(item.login.uri)"
                >
                  <i class="fas fa-external-link-square-alt" />
              </button>
              <el-dropdown trigger="click" :hide-on-click="false">
                <button class="btn btn-icon btn-xs hover:bg-black-400">
                  <i class="fas fa-clone" />
                </button>
                <el-dropdown-menu slot="dropdown">
                  <div v-if="item.type === CipherType.Login">
                    <el-dropdown-item
                      v-clipboard:copy="item.login.username"
                      v-clipboard:success="clipboardSuccessHandler"
                    >
                      {{ $t('common.copy') }} {{ $t('common.username') }}
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-clipboard:copy="item.login.password"
                      v-clipboard:success="clipboardSuccessHandler"
                    >
                      {{ $t('common.copy') }} {{ $t('common.password') }}
                    </el-dropdown-item>
                  </div>
                  <div v-if="item.type === CipherType.SecureNote">
                    <el-dropdown-item
                      v-clipboard:copy="item.notes"
                      v-clipboard:success="clipboardSuccessHandler"
                      divided
                    >
                      {{ $t('common.copy') }} {{ $t('common.note') }}
                    </el-dropdown-item>
                  </div>
                </el-dropdown-menu>
              </el-dropdown>
              <button class="btn btn-icon btn-xs hover:bg-black-400"
                      @click="addEdit(item)"
              >
                <i class="fas fa-pen" />
              </button>
            </div>
          </div>
        </li>
      </ul>
      <ul v-else class="">
        <div
          v-if="loginCiphers.length"
          class="uppercase px-3 border-t border-black-400"
        >Logins ({{loginCiphers.length}})</div>
        <li
          v-for="item in loginCiphers"
          :key="item.id"
          class="flex items-center hover:bg-black-400 cursor-pointer h-[62px] px-5"
          @click="fillCipher(item)"
        >
          <div class="flex-grow">
            <div class="text-black font-semibold truncate flex items-center">
              {{ item.name }}
            </div>
            <div>
              {{ item.subTitle }}
            </div>
          </div>
          <div>
            <div class="col-actions">
              <button
                v-if="item.login.canLaunch"
                class="btn btn-icon btn-xs hover:bg-black-400"
                :title="`Launch ${item.login.uri}`"
                @click="openNewTab(item.login.uri)"
              >
                <i class="fas fa-external-link-square-alt" />
              </button>
              <el-dropdown
                trigger="click"
                :hide-on-click="false"
              >
                <button class="btn btn-icon btn-xs hover:bg-black-400">
                  <i class="fas fa-clone" />
                </button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-clipboard:copy="item.login.username"
                    v-clipboard:success="clipboardSuccessHandler"
                  >
                    {{ $t('common.copy') }} {{ $t('common.username') }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-clipboard:copy="item.login.password"
                    v-clipboard:success="clipboardSuccessHandler"
                  >
                    {{ $t('common.copy') }} {{ $t('common.password') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <button
                class="btn btn-icon btn-xs hover:bg-black-400"
                @click="addEdit(item)"
              >
                <i class="fas fa-pen" />
              </button>
            </div>
          </div>
        </li>
        <div
          v-if="cardCiphers.length"
          class="uppercase px-3 border-t border-black-400"
        >Cards ({{cardCiphers.length}})</div>
        <li
          v-for="item in cardCiphers"
          :key="item.id"
          class="flex items-center hover:bg-black-400 cursor-pointer h-[62px] px-5"
        >
          <div class="flex-grow">
            <div class="text-black font-semibold truncate flex items-center">
              {{ item.name }}
            </div>
            <div>
              {{ item.subTitle }}
            </div>
          </div>
          <div>
            <div class="col-actions">
              <button
                class="btn btn-icon btn-xs hover:bg-black-400"
                @click="addEdit(item)"
              >
                <i class="fas fa-pen" />
              </button>
            </div>
          </div>
        </li>
        <div
          v-if="identityCiphers.length"
          class="uppercase px-3 border-t border-black-400"
        >Identities ({{identityCiphers.length}})</div>
        <li
          v-for="item in identityCiphers"
          :key="item.id"
          class="flex items-center hover:bg-black-400 cursor-pointer h-[62px] px-5"
        >
          <div class="flex-grow">
            <div class="text-black font-semibold truncate flex items-center">
              {{ item.name }}
            </div>
            <div>
              {{ item.subTitle }}
            </div>
          </div>
          <div>
            <div class="col-actions">
              <button
                class="btn btn-icon btn-xs hover:bg-black-400"
                @click="addEdit(item)"
              >
                <i class="fas fa-pen" />
              </button>
            </div>
          </div>
        </li>
        <li
          class="flex items-center hover:bg-black-400 cursor-pointer h-[44px] leading-[44px] px-5 border-t border-black-400"
          @click="openVault"
        >
          <div class="menu-icon mr-4">
            <i class="fas fa-home text-[20px]"></i>
          </div>
          <div class="flex-grow">
            Open my Vault
          </div>
        </li>
        <li
          class="flex items-center hover:bg-black-400 cursor-pointer h-[44px] leading-[44px] px-5"
          @click="openRoute({routeName: 'vault'})"
        >
          <div class="menu-icon mr-4">
            <i class="fas fa-home text-[20px]"></i>
          </div>
          <div class="flex-grow">
            All items
          </div>
          <div>
            <i class="fas fa-chevron-right"></i>
          </div>
        </li>
        <!-- <li
          class="flex items-center hover:bg-black-400 cursor-pointer h-[44px] leading-[44px] px-5 border-t border-black-400"
          @click="openRoute({routeName: 'add_item'})"
        >
          <div class="menu-icon mr-4">
            <i class="fas fa-plus-circle text-[20px]"></i>
          </div>
          <div class="flex-grow">
            Add item
          </div>
          <div>
            <i class="fas fa-chevron-right"></i>
          </div>
        </li> -->
        <li
          class="flex items-center hover:bg-black-400 cursor-pointer h-[44px] leading-[44px] px-5"
          @click="openRoute({routeName: 'generator'})"
        >
          <div class="menu-icon mr-4">
            <i class="fas fa-home text-[20px]"></i>
          </div>
          <div class="flex-grow">
            Generate secure password
          </div>
          <div>
            <i class="fas fa-chevron-right"></i>
          </div>
        </li>
        <li
          class="flex items-center hover:bg-black-400 cursor-pointer h-[44px] leading-[44px] px-5 border-t border-black-400"
          @click="openRoute({routeName: 'settings'})"
        >
          <div class="menu-icon mr-4">
            <i class="fas fa-home text-[20px]"></i>
          </div>
          <div class="flex-grow">
            Settings
          </div>
          <div>
            <i class="fas fa-chevron-right"></i>
          </div>
        </li>
        <li
          class="flex items-center hover:bg-black-400 cursor-pointer h-[44px] leading-[44px] px-5"
          @click="logout"
        >
          <div class="menu-icon mr-4">
            <i class="fas fa-sign-out-alt text-[20px]"></i>
          </div>
          <div class="flex-grow">
            Log Out
          </div>
          <div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import orderBy from "lodash/orderBy";
import groupBy from 'lodash/groupBy';
import { BrowserApi } from "@/browser/browserApi";
import { Utils } from "jslib-common/misc/utils";
import { CipherType } from "jslib-common/enums/cipherType";
import { ConstantsService } from "jslib-common/services/constants.service";
import { StorageService } from "jslib-common/abstractions/storage.service";
import BrowserStorageService from "@/services/browserStorage.service";
import { CipherView } from "jslib-common/models/view/cipherView";
import { CipherRepromptType } from "jslib-common/enums/cipherRepromptType";
const BroadcasterSubscriptionId = "CurrentTabComponent";
export default Vue.extend({
  name: "Home",
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
      searchText: "",
      inSidebar: false,
      searchTypeSearch: false,
      loaded: false,

      totpCode: "",
      totpTimeout: null,
      loadedTimeout: null,
      searchTimeout: null,
    };
  },
  async mounted() {
    // BrowserApi.messageListener('home.popup', async (msg: any, sender: chrome.runtime.MessageSender, sendResponse: any) => {
    //   await this.processMessage(msg, sender, sendResponse);
    // });
    chrome.runtime.onMessage.addListener((msg: any, sender: chrome.runtime.MessageSender, response: any) => {
      this.processMessage(msg, sender, response);
    });
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

    window.setTimeout(() => {
      document.getElementById('search').focus();
    }, 100);
  },
  destroyed() {
    window.clearTimeout(this.loadedTimeout)
  },
  asyncComputed: {
    ciphers: {
      async get () {
        const deletedFilter = c => {
          return c.isDeleted === false
        }
        const result = await this.$searchService.searchCiphers(this.searchText, [null, deletedFilter], null) || []

        return orderBy(result, [c => this.orderField === 'name' ? (c.name && c.name.toLowerCase()) : c.revisionDate], [this.orderDirection]) || []
      },
      watch: ['$store.state.syncedCiphersToggle', 'deleted', 'searchText', 'filter', 'orderField', 'orderDirection']
    }
  },
  methods: {
    openLogin() {
      const url = `${
        process.env.VUE_APP_ID_URL
      }/login?SERVICE_URL=${encodeURIComponent(
        "/sso"
      )}&SERVICE_SCOPE=pwdmanager&CLIENT=browser`;

      this.$platformUtilsService.launchUri(url);
      BrowserApi.reloadOpenWindows();
      const thisWindow = window.open("", "_self");
      thisWindow.close();
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
      this.$platformUtilsService.launchUri("/web.html#/vault");
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
      console.log('popup send cmd: collectPageDetails')
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
      this.$platformUtilsService.launchUri(`/web.html#/vault/${item.id}`);
    },
    async fillCipher(cipher: CipherView) {
      console.log(this.pageDetails.length)
      if (cipher.reprompt !== CipherRepromptType.None && !await this.$passwordRepromptService.showPasswordPrompt()) {
        return;
      }

      this.totpCode = null;
      if (this.totpTimeout != null) {
        window.clearTimeout(this.totpTimeout);
      }

      if (this.pageDetails == null || this.pageDetails.length === 0) {
        // this.toasterService.popAsync('error', null, this.$i18nService.t('autofillError'));
        this.notify('Unable to auto-fill the selected item on this page. Copy and paste the information instead.', 'warning')
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
          this.$platformUtilsService.copyToClipboard(this.totpCode, { window: window });
        }
        if (this.$popupUtilsService.inPopup(window)) {
          if (this.$platformUtilsService.isFirefox() || this.$platformUtilsService.isSafari()) {
            BrowserApi.closePopup(window);
          } else {
            // Slight delay to fix bug in Chromium browsers where popup closes without copying totp to clipboard
            setTimeout(() => BrowserApi.closePopup(window), 50);
          }
        }
      } catch (e) {
        // this.ngZone.run(() => {
        //   this.toasterService.popAsync('error', null, this.$i18nService.t('autofillError'));
        //   this.changeDetectorRef.detectChanges();
        // });
        // this.notify('Unable to auto-fill the selected item on this page. Copy and paste the information instead.', 'warning')
        this.notify(e, 'warning')
      }
    },
    async processMessage(msg: any, sender: any, sendResponse: any) {
      console.log(`popup.home processMessage, sender: ${msg.sender}, cmd: ${msg.command}`)
      switch (msg.command) {
      case 'syncCompleted':
        window.alert('home: syncCompleted')
        if (this.loaded) {
          window.setTimeout(() => {
            this.load();
          }, 500);
        }
        break;
      case 'collectPageDetailsResponse':
        console.log('home: collectPageDetails')
        if (msg.sender === BroadcasterSubscriptionId) {
          const pageDetailsObj = {
            // frameId: msg.webExtSender.frameId,
            tab: msg.tab,
            details: msg.details,
          }
          this.pageDetails.push(pageDetailsObj);
        }
        break;
      default:
        break;
      }
    }
  },
});
</script>
