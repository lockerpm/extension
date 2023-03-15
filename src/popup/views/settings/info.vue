<template>
  <div
    class="relative h-screen"
    style="background: #fff; padding-top: 76px"
  >
    <div
      class="grid grid-cols-4 bg-white fixed top-0"
      style="z-index: 1; width: 400px; padding:28px 16px; align-items: center"
    >
      <div
        class="menu-icon cursor-pointer"
        @click="$router.back()"
      >
        <i class="fas fa-arrow-left text-[20px]"></i>
      </div>
      <div class="text-center text-head-6 font-semibold col-span-2">
        {{$t('data.settings.about')}}
      </div>
    </div>
    <div class="">
      <div class="text-black text-head-6 font-semibold p-4">
        {{$t('data.settings.version')}} {{version}}
      </div>
      <div class="info-section">
        <a target="_blank" href="https://locker.io/terms">
          {{$t('data.settings.term')}}
        </a>
      </div>
      <div class="info-section">
        <a target="_blank" href="https://locker.io/privacy">
          {{$t('data.settings.privacy')}}
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { VAULT_TIMEOUTS } from '@/constants/index'

export default Vue.extend({
  data() {
    return {
      user: {},
      loading: false,
    };
  },
  computed: {
    vaultTimeouts() {
      return VAULT_TIMEOUTS;
    },
    version() {
      return chrome.runtime.getManifest().version;
    },
  },
  async mounted() {
    this.getUser();
  },
  methods: {
    async getUser() {
      const user = await this.$store.dispatch("LoadCurrentUserPw");
      this.user = { ...user };
    },
    async putUser(timeoutValue) {
      this.user.timeout = timeoutValue;
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
