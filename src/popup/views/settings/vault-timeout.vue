<template>
  <div
    class="relative h-screen"
    style="background: #fff; padding-top: 82px"
  >
    <div
      class="grid grid-cols-4 bg-white px-4 pb-4 fixed top-0"
      style="z-index: 1; width: 400px; padding-top: 24px; align-items: center"
    >
      <div
        class="menu-icon cursor-pointer"
        @click="$router.back()"
      >
        <i class="fas fa-arrow-left text-[20px]"></i>
      </div>
      <div class="text-center text-head-6 font-semibold col-span-2">
        {{$t('data.settings.vault_timeout')}}
      </div>
    </div>
    <div class="">
      <div class="text-black-500 p-4">
        {{$t('data.settings.vault_timeout_details')}}
      </div>
      <div class="">
        <div
          v-for="option in vaultTimeouts"
          :key="option.value"
          class="timeout-option"
          @click="putUser(option.value)"
        >
          {{option.label}}
          <div v-if="user.timeout === option.value" class="text-primary" style="font-size: 8px; line-height: 8px; padding: 5px; border-radius: 50%; border: 1px solid green">
            <i
              class="fas fa-circle"
            />
          </div>
          <div v-else style="width: 20px; height: 20px; border-radius: 50%; border: 1px solid #A2A3A7">

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { VAULT_TIMEOUTS } from '@/config/constants';

import cystackPlatformAPI from '@/api/cystack_platform';

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
      this.user.timeout = timeoutValue
      try {
        this.loading = true;
        await cystackPlatformAPI.update_users_me(this.user);
        this.$store.commit("UPDATE_USER_PW", this.user);
        this.$vaultTimeoutService.setVaultTimeoutOptions(
          this.user.timeout,
          this.user.timeout_action
        );
        this.notify(
          this.$t("data.notifications.update_settings_success"),
          "success"
        );
        const now = (new Date()).getTime()
        this.$storageService.save('lastActive', now)
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
