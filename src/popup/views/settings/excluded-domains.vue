<template>
  <div
    class="show-body bg-white"
  >
    <div class="p-4">
      <div class="font-semibold">
        {{$t('data.settings.excluded_domains_desc')}}
      </div>
      <span class="text-black-500">
        {{$t('data.settings.excluded_domains_details')}}
      </span>
      <div class="mt-3">
        <template v-for="(domain, index) in excludedDomains">
          <div
            :key="index"
            class="flex justify-between"
            style="padding: 16px 0px"
          >
            <div class="text-head-6">
              {{domain.uri}}
            </div>
            <div
              class="cursor-pointer text-danger font-semibold"
              @click="removeUri(index)"
            >{{$t('common.remove')}}</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { ConstantsService } from "jslib-common/services/constants.service";
import { Utils } from "jslib-common/misc/utils";
export default Vue.extend({
  data() {
    return {
      excludedDomains: [],
      test: {
        name: "",
      },
      name: "",
    };
  },
  async mounted() {
    const savedDomains = await this.$storageService.get(
      ConstantsService.neverDomainsKey
    );
    if (savedDomains) {
      for (const uri of Object.keys(savedDomains)) {
        this.excludedDomains.push({ uri: uri, showCurrentUris: false });
      }
    }
  },
  methods: {
    async addUri() {
      this.excludedDomains.push({ uri: "", showCurrentUris: false });
    },
    async removeUri(i: number) {
      this.excludedDomains.splice(i, 1);
      await this.submit()
      this.notify(
        this.$t("data.notifications.update_settings_success"),
        "success"
      );
    },
    async submit() {
      const savedDomains: { [name: string]: null } = {};
      for (const domain of this.excludedDomains) {
        if (domain.uri && domain.uri !== "") {
          const validDomain = Utils.getHostname(domain.uri);
          if (!validDomain) {
            this.notify(
              `${domain.uri || "google.com"} is not a valid domain`,
              "error"
            );
            return;
          }
          savedDomains[validDomain] = null;
        }
      }
      await this.$storageService.save(
        ConstantsService.neverDomainsKey,
        savedDomains
      );
    },
  },
});
</script>
