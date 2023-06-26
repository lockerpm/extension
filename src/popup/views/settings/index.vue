<template>
  <div>
    <div>
      <div
        v-for="(cate, index) in menu"
        :key="index"
        class="mb-4"
      >
        <div
          class="uppercase mb-2 font-semibold text-gray"
          style="font-size: 14px"
        >
          {{cate.name}}
        </div>
        <ul class="popup-setting-wrapper">
          <li
            v-for="(item, index) in cate.items"
            :key="index"
            class="popup-setting-section"
            @click="() => openRoute(item)"
          >

            <div class="flex-grow">
              <div v-if="item.avatar" class="flex items-center">
                <img
                  class="w-[32px] h-[32px] rounded-full mr-2"
                  :src="item.avatar"
                  alt=""
                >
                <div>{{ item.email }}</div>
              </div>
              <div v-else-if="item.info">
                <img style="height: 24px" src="@/assets/images/logo/logo_black.svg">
              </div>
              <div v-else class="setting-title font-semibold">
                {{  item.name  }}
              </div>
              <div class="setting-desc">
                {{  item.desc  }}
              </div>
            </div>
            <template v-if="item.routeName || item.email">
              <div>
                <i class="fas fa-chevron-right"></i>
              </div>
            </template>
            <template v-if="item.switch">
              <div>
                <el-switch
                  v-model="storage[`${item.key}`]"
                  active-color="#13ce66"
                  @change="changeStorage(item.key)"
                ></el-switch>
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
        <el-button
          class="w-full"
          plain
          style="border-radius: 12px;"
          @click="() => lock()"
        >
          {{ $t('data.settings.lock_now') }}
        </el-button>
      </div>
      <div class="mt-2">
        <el-button
          class="w-full"
          type="danger"
          plain
          style="border-radius: 12px;"
          @click="() => logout()"
        >
          {{ $t('common.logout') }}
        </el-button>
      </div>
      <div class="mt-4 flex items-center justify-center">
        {{ $t('data.settings.a_product_of') }}
        <a href="https://cystack.net" target="_blank">
          <img class="h-4 ml-2" src="@/assets/images/logo/CyStack.png" alt="CyStack"/>
        </a>
      </div>
    </div>
    <Fingerprint
      ref="fingerprintDialog"
    />
  </div>
</template>

<script>
import Vue from "vue";
import Fingerprint from "@/popup/components/setting/Fingerprint.vue";
import i18n from '@/locales/i18n';
import { VAULT_TIMEOUTS } from '@/config/constants'
const enableAutofillKey = 'enableAutofill'
const showFoldersKey = 'showFolders'
const hideIconsKey = 'hideIcons'
const accountInfoKey = 'accountInfoKey'

export default Vue.extend({
  name: "Settings",
  components: {
    Fingerprint,
  },
  async mounted() {
    const res = await Promise.all([
      this.$storageService.get(enableAutofillKey),
      this.$storageService.get(showFoldersKey),
      this.$storageService.get(hideIconsKey),
    ])
    this.storage.enableAutofill = res[0] == null ? true : res[0]
    this.storage.showFolders = res[1] == null ? true : res[1]
    this.storage.hideIcons = res[2] == null ? false : res[2]
  },
  data() {
    return {
      loading: false,
      fingerprintDialog: false,
      storage: {
        enableAutofill: true,
        showFolders: true,
        hideIcons: false
      }
    };
  },
  computed: {
    vaultTimeouts() {
      return VAULT_TIMEOUTS;
    },
    menu() {
      return [
        {
          name: this.$t("common.plan"),
          items: [
            {
              key: accountInfoKey,
              avatar: this.currentUser.avatar,
              email: this.currentUser.email,
            },
          ],
        },
        {
          name: this.$t("data.settings.autofill"),
          items: [
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
          items: [
            {
              name: this.$t("data.settings.vault_timeout"),
              desc: this.$t("data.settings.vault_timeout_desc"),
              routeName: "settings-vault-timeout",
            },
            {
              name: this.$t("data.settings.hide_icons"),
              desc: this.$t("data.settings.hide_icons_desc"),
              switch: true,
              key: hideIconsKey,
            }
          ],
        },
        {
          name: this.$t("data.settings.help_feedback"),
          items: [
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
            }
          ],
        },
      ];
    },
    language () {
      return i18n.locale
    }
  },
  methods: {
    openRoute(item) {
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
          this.openFingerprintDialog();
          break;
        case "vault_timeout":
        case "vault_timeout_action":
        default:
          break;
        }
      } else if (item.externalUrl) {
        this.$platformUtilsService.launchUri(item.externalUrl);
      } else if (item.email) {
        this.$runtimeBackground.authAccessToken('id-info')
      } else {
        this.$router.push({ name: item.routeName }).catch(() => ({}));
      }
    },
    openFingerprintDialog() {
      this.$refs.fingerprintDialog.openDialog();
    },
    async changeStorage(key){
      if(key === hideIconsKey){
        this.$store.commit('UPDATE_HIDE_ICONS', this.storage[hideIconsKey])
      }
      if(key === showFoldersKey){
        this.$store.commit('UPDATE_SHOW_FOLDERS', this.storage[showFoldersKey])
      }
      if(key === enableAutofillKey){
        this.$store.commit('UPDATE_ENABLE_AUTOFILL', this.storage[enableAutofillKey])
      }
      await this.$storageService.save(
        key,
        this.storage[key]
      )
      if (key === enableAutofillKey && this.storage[enableAutofillKey]) {
        await this.setupFillPage()
      }
    }
  },
});
</script>
