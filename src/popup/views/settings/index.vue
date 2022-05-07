<template>
  <div
    style="padding-top: 90px; padding-bottom: 32px"
  >
    <Header></Header>
    <div class="p-4 text-[#A2A3A7]">
      <div
        v-for="(cate, index) in menu"
        :key="index"
      >
        <p class="uppercase px-3 mt-4 mb-1 font-semibold">{{cate.name}}</p>
        <ul class="popup-setting-wrapper">
          <li
            v-for="(item, index) in cate.items"
            :key="index"
            class="popup-setting-section"
            @click="item.routeName || item.externalUrl ? openRoute(item) : ''"
          >

            <div class="flex-grow">
              <div v-if="item.info">
                <img style="height: 24px" src="@/assets/images/logo/logo_black.svg">
              </div>
              <div v-else class="setting-title">
                {{  item.name  }}
              </div>
              <div class="setting-desc">
                {{  item.desc  }}
              </div>
            </div>
            <template v-if="item.routeName">
              <div>
                <i class="fas fa-chevron-right"></i>
              </div>
            </template>
            <template v-if="item.switch">
              <div>
                <el-switch @change="changeStorage(item.key)" v-model="storage[`${item.key}`]"></el-switch>
              </div>
            </template>
            <template v-if="item.externalUrl">
              <div>
                <i class="fas fa-external-link-square-alt" />
              </div>
            </template>
          </li>
        </ul>
      </div>
      <div class="mt-4">
        <div class="popup-setting-wrapper p-4 flex justify-between">
          <div class="text-black">
            {{$t("data.settings.logged_in_as")}} <span class="font-semibold">{{currentUser.email}}</span>
          </div>
          <div class="text-danger cursor-pointer" @click="logout">
            {{$t("data.settings.logout")}}
          </div>
        </div>
      </div>
    </div>
    <Footer></Footer>
    <Fingerprint ref="fingerprintDialog" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { BrowserApi } from "@/browser/browserApi";
import Fingerprint from "@/popup/components/setting/Fingerprint.vue";
import Header from "@/popup/components/layout/parts/Header";
import Footer from "@/popup/components/layout/parts/Footer";
const enableAutofillKey = 'enableAutofill'
const showFoldersKey = 'showFolders'
const hideIconsKey = 'hideIcons'
export default Vue.extend({
  name: "Settings",
  components: {
    Fingerprint,
    Header,
    Footer,
  },
  async mounted() {
    chrome.runtime.onMessage.addListener(
      (msg: any, sender: chrome.runtime.MessageSender, response: any) => {
        this.processMessage(msg, sender, response);
      }
    );
    const res = await Promise.all([
      this.$storageService.get(enableAutofillKey),
      this.$storageService.get(showFoldersKey),
      this.$storageService.get(hideIconsKey),
    ])
    this.storage.enableAutofill = res[0] || true
    this.storage.showFolders = res[1] || true
    this.storage.hideIcons = res[2] || false
    this.getUser();
  },
  data() {
    return {
      user: {},
      loading: false,
      fingerprintDialog: false,
      storage: {
        enableAutofill: true,
        showFolders: true,
        hideIcons: false
      }
    };
  },
  // asyncComputed: {
  //   enableAutofill: {
  //     async get() {
  //       return await this.$storageService.get('enableAutofill');
  //     },
  //     watch: [
  //       "$storageService",
  //     ]
  //   }
  // },
  computed: {
    vaultTimeouts() {
      return [
        { label: this.$t("data.timeouts.oneMinute"), value: 1 },
        { label: this.$t("data.timeouts.fiveMinutes"), value: 5 },
        { label: this.$t("data.timeouts.fifteenMinutes"), value: 15 },
        { label: this.$t("data.timeouts.thirtyMinutes"), value: 30 },
        { label: this.$t("data.timeouts.oneHour"), value: 60 },
        { label: this.$t("data.timeouts.fourHours"), value: 240 },
        { label: this.$t("data.timeouts.onRefresh"), value: -1 },
      ];
    },
    vaultTimeoutActions() {
      return [
        { label: this.$t("common.lock"), value: "lock" },
        { label: this.$t("common.logout"), value: "logOut" },
      ];
    },
    menu() {
      return [
        {
          name: this.$t("data.settings.autofill"),
          divided: false,
          items: [
            // {
            //   routeName: "",
            //   externalUrl: "https://locker.io/vault",
            //   name: this.$t("data.settings.go_to_web_vault"),
            // },
            // {
            //   routeName: "",
            //   externalUrl: "https://locker.io/settings/options#import",
            //   name: this.$t("data.settings.import_export"),
            // },
            {
              name: this.$t("data.settings.enable_autofill"),
              desc: this.$t("data.settings.enable_autofill_desc"),
              switch: true,
              key: enableAutofillKey,
            },
            {
              routeName: "settings-excluded-domains",
              name: this.$t("data.settings.excluded_domains"),
              desc: this.$t("data.settings.excluded_domains_desc"),
            },
          ],
        },
        {
          name: this.$t("data.settings.options"),
          divided: true,
          items: [
            {
              name: this.$t("data.settings.vault_timeout"),
              desc: this.$t("data.settings.vault_timeout_desc"),
              routeName: "settings-vault-timeout",
            },
            {
              name: this.$t("data.settings.show_folders"),
              desc: this.$t("data.settings.show_folders_desc"),
              switch: true,
              key: showFoldersKey,
            },
            {
              name: this.$t("data.settings.hide_icons"),
              desc: this.$t("data.settings.hide_icons_desc"),
              switch: true,
              key: hideIconsKey,
            },
            // {
            //   name: this.$t("data.settings.vault_timeout_action"),
            //   action: "vault_timeout_action",
            //   picker: true,
            // },
            // {
            //   externalUrl: "/web.html#/settings/exclude-domains",
            //   action: "fingerprint",
            //   name: this.$t("data.settings.fingerprint_phase"),
            // },
            // {
            //   lock: true,
            //   name: this.$t("data.settings.lock_now"),
            // },
          ],
        },
        // {
        //   name: this.$t("data.settings.account"),
        //   divided: true,
        //   items: [
        //     {
        //       icon: "fa-home",
        //       routeName: "",
        //       externalUrl: "https://locker.io/plans",
        //       name: this.$t("data.settings.upgrade_to_premium"),
        //     },
        //     {
        //       icon: "fa-home",
        //       routeName: "",
        //       externalUrl: "https://locker.io/settings/security",
        //       name: this.$t("data.settings.change_master_password"),
        //     },
        //     {
        //       icon: "fa-home",
        //       routeName: "",
        //       externalUrl: "https://locker.io/settings/account",
        //       name: this.$t("data.settings.manage_your_account"),
        //     },
        //     {
        //       icon: "fa-home",
        //       routeName: "",
        //       externalUrl: "/web.html#/settings/",
        //       action: "sync_data",
        //       name: this.$t("data.settings.sync_data"),
        //     },
        //     {
        //       icon: "fa-home",
        //       routeName: "",
        //       externalUrl: "",
        //       logout: true,
        //       name: this.$t("data.settings.logout"),
        //     },
        //   ],
        // },
        {
          name: this.$t("data.settings.help_feedback"),
          divided: true,
          items: [
            // {
            //   externalUrl: "https://cystack.net/about",
            //   name: this.$t("data.settings.about"),
            // },
            {
              externalUrl: "https://support.locker.io",
              name: this.$t("data.settings.support_center"),
            },
            {
              externalUrl: "https://zo8rr5fc706.typeform.com/to/OotlSyQ7",
              name: this.$t("data.settings.feedback"),
            },
            {
              routeName: "settings-info",
              desc: this.$t("data.settings.info_desc", {version: chrome.runtime.getManifest().version}),
              info: true,
            },
            // {
            //   externalUrl:
            //     "https://chrome.google.com/webstore/detail/cystack-locker-free-passw/cmajindocfndlkpkjnmjpjoilibjgmgh",
            //   name: this.$t("data.settings.rate_extension"),
            // },
            // {
            //   externalUrl: "https://locker.io/contact",
            //   name: this.$t("data.settings.contact_us"),
            // }
          ],
        },
      ];
    },
  },
  methods: {
    openRoute(item) {
      // console.log(item.name)
      if (item.lock) {
        this.lock();
      } else if (item.logout) {
        this.logout();
      } else if (item.action) {
        switch (item.action) {
        case "sync_data":
          this.getSyncData();
          break;
        case "fingerprint":
          // this.fingerprintDialog = true
          this.openFingerprintDialog();
          break;
        case "vault_timeout":
        case "vault_timeout_action":
        default:
          break;
        }
      } else if (item.externalUrl) {
        this.$platformUtilsService.launchUri(item.externalUrl);
      } else {
        this.$router.push({ name: item.routeName });
      }
    },
    async test() {
      const test = await BrowserApi.getTabFromCurrentWindow();
      console.log(test);
    },
    async processMessage(msg: any, sender: any, sendResponse: any) {
      switch (msg.command) {
      case "syncCompleted":
        // console.log('sync complete')
        if (msg.successfully && msg.trigger) {
          this.notify("Syncing complete", "success");
        }
        break;
      default:
        break;
      }
    },
    openFingerprintDialog() {
      this.$refs.fingerprintDialog.openDialog();
    },
    async getUser() {
      const user = await this.$store.dispatch("LoadCurrentUserPw");
      this.user = { ...user };
    },
    async putUser() {
      try {
        this.loading = true;
        await this.axios.put("cystack_platform/pm/users/me", this.user);
        this.$store.commit("UPDATE_USER_PW", this.user);
        this.$vaultTimeoutService.setVaultTimeoutOptions(
          this.user.timeout,
          this.user.timeout_action
        );
        this.notify(
          this.$t("data.notifications.update_settings_success"),
          "success"
        );
      } catch (e) {
        console.log(e);
        this.notify(
          this.$t("data.notifications.update_settings_failed"),
          "warning"
        );
      } finally {
        this.loading = false;
      }
    },
    async changeStorage(key){
      if(key === hideIconsKey){
        this.$store.commit('UPDATE_HIDE_ICONS', this.storage[hideIconsKey])
      }
      await this.$storageService.save(
        key,
        this.storage[key]
      )
    }
  },
});
</script>
