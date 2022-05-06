<template>
  <div
    class="text-[#A2A3A7]"
    style="padding-top: 90px; padding-bottom: 32px"
  >
    <Header></Header>
    <div class="p-4">
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
            :class="[item.divided ? 'border-t border-black-400' : '', item.picker ? 'h-auto leading-[32px]': 'h-[44px] leading-[44px]']"
            @click="openRoute(item)"
          >
            <template v-if="item.action==='vault_timeout'">
              <div class="w-full py-2">
                <div>{{item.name}}</div>
                <el-select
                  class="w-full"
                  v-model="user.timeout"
                  placeholder=""
                  :disabled="loading"
                  size="small"
                  @change="putUser"
                >
                  <el-option
                    v-for="item in vaultTimeouts"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
            </template>
            <template v-else-if="item.action==='vault_timeout_action'">
              <div class="w-full py-2">
                <div>{{item.name}}</div>
                <el-select
                  class="w-full"
                  v-model="user.timeout_action"
                  placeholder=""
                  :disabled="loading"
                  @change="putUser"
                  size="small"
                >
                  <el-option
                    v-for="item in vaultTimeoutActions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
            </template>
            <template v-else>
              <div class="flex-grow">
                {{  item.name  }}
              </div>
              <div>
                <i class="fas fa-chevron-right"></i>
              </div>
            </template>
          </li>
        </ul>
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
    this.getUser();
  },
  data() {
    return {
      user: {},
      loading: false,
      fingerprintDialog: false,
    };
  },
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
          name: this.$t("data.settings.general"),
          divided: false,
          items: [
            {
              icon: "fa-home",
              routeName: "",
              // externalUrl: '/web.html#/vault',
              externalUrl: "https://locker.io/vault",
              name: this.$t("data.settings.go_to_web_vault"),
            },
            {
              icon: "fa-home",
              routeName: "",
              // externalUrl: '/web.html#/settings/import-export',
              externalUrl: "https://locker.io/settings/options#import",
              name: this.$t("data.settings.import_export"),
            },
            {
              icon: "fa-home",
              routeName: "settings-excluded-domains",
              name: this.$t("data.settings.excluded_domains"),
            },
            // {
            //   icon: 'fa-home',
            //   routeName: 'settings-support',
            //   externalUrl: '',
            //   name: 'Theme (Light/Dark)'
            // }
          ],
        },
        {
          name: this.$t("data.settings.security"),
          divided: true,
          items: [
            {
              icon: "fa-home",
              routeName: "",
              // externalUrl: '/web.html#/settings',
              externalUrl: "https://locker.io/settings/options",
              name: this.$t("data.settings.vault_timeout"),
              action: "vault_timeout",
              picker: true,
            },
            {
              icon: "fa-home",
              routeName: "",
              // externalUrl: '/web.html#/settings',
              externalUrl: "https://locker.io/settings/options",
              name: this.$t("data.settings.vault_timeout_action"),
              action: "vault_timeout_action",
              picker: true,
            },
            // {
            //   icon: 'fa-home',
            //   routeName: '',
            //   externalUrl: '/web.html#/settings/import-export',
            //   name: 'Two-step Login'
            // },
            {
              icon: "fa-home",
              routeName: "",
              externalUrl: "/web.html#/settings/exclude-domains",
              action: "fingerprint",
              name: this.$t("data.settings.fingerprint_phase"),
            },
            {
              icon: "fa-home",
              routeName: "",
              externalUrl: "",
              lock: true,
              name: this.$t("data.settings.lock_now"),
            },
          ],
        },
        {
          name: this.$t("data.settings.account"),
          divided: true,
          items: [
            {
              icon: "fa-home",
              routeName: "",
              // externalUrl: '/web.html#/upgrade/',
              externalUrl: "https://locker.io/plans",
              name: this.$t("data.settings.upgrade_to_premium"),
            },
            {
              icon: "fa-home",
              routeName: "",
              // externalUrl: '/web.html#/settings?action=change-master-password',
              externalUrl: "https://locker.io/settings/security",
              name: this.$t("data.settings.change_master_password"),
            },
            {
              icon: "fa-home",
              routeName: "",
              // externalUrl: '/web.html#/settings/',
              externalUrl: "https://locker.io/settings/account",
              name: this.$t("data.settings.manage_your_account"),
            },
            {
              icon: "fa-home",
              routeName: "",
              externalUrl: "/web.html#/settings/",
              action: "sync_data",
              name: this.$t("data.settings.sync_data"),
            },
            {
              icon: "fa-home",
              routeName: "",
              externalUrl: "",
              logout: true,
              name: this.$t("data.settings.logout"),
            },
          ],
        },
        {
          name: this.$t("data.settings.support"),
          divided: true,
          items: [
            {
              icon: "fa-home",
              routeName: "",
              externalUrl: "https://cystack.net/about",
              name: this.$t("data.settings.about"),
            },
            {
              icon: "fa-home",
              routeName: "",
              externalUrl: "https://support.locker.io",
              name: this.$t("data.settings.support_center"),
            },
            {
              icon: "fa-home",
              routeName: "",
              externalUrl: "https://zo8rr5fc706.typeform.com/to/OotlSyQ7",
              name: this.$t("data.settings.feedback"),
            },
            {
              icon: "fa-home",
              routeName: "",
              externalUrl:
                "https://chrome.google.com/webstore/detail/cystack-locker-free-passw/cmajindocfndlkpkjnmjpjoilibjgmgh",
              name: this.$t("data.settings.rate_extension"),
            },
            {
              icon: "fa-home",
              routeName: "",
              externalUrl: "https://locker.io/contact",
              name: this.$t("data.settings.contact_us"),
            },
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
        if (this.$route.path === "/settings/" && msg.successfully) {
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
  },
});
</script>
