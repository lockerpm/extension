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
          <div v-if="user.timeout===option.value" class="text-primary" style="font-size: 8px; line-height: 8px; padding: 5px; border-radius: 50%; border: 1px solid green">
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
export default Vue.extend({
  data() {
    return {
      user: {},
      loading: false,
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
