<template>
  <div>
    <div>
      <div class="font-semibold">
        {{$t('data.settings.vault_timeout_desc')}}
      </div>
      <span class="text-black-500">
        {{$t('data.settings.vault_timeout_details')}}
      </span>
    </div>
    <div class="mt-2">
      <div
        v-for="option in vaultTimeouts"
        :key="option.value"
        class="timeout-option"
        @click="putUser(option.value)"
      >
        <div class="font-semibold">
          {{option.label}}
        </div>
        <div
          v-if="user.timeout === option.value"
          class="text-primary cursor-pointer"
          style="font-size: 8px; line-height: 8px; padding: 5px; border-radius: 50%; border: 1px solid green"
        >
          <i
            class="fas fa-circle"
          />
        </div>
        <div
          v-else
          class="cursor-pointer"
          style="width: 20px; height: 20px; border-radius: 50%; border: 1px solid #A2A3A7"
        />
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
      const user = await cystackPlatformAPI.users_me();
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
