<template>
  <div
    class="bg-white"
  >
    <div class="font-semibold">
      {{$t('data.settings.excluded_domains_desc')}}
    </div>
    <span class="text-black-500">
      {{$t('data.settings.excluded_domains_details')}}
    </span>
    <div class="mt-3">
      <template v-for="(domain, index) in (excludedDomains || [])">
        <div
          :key="index"
          class="flex justify-between py-2"
        >
          <div class="text-head-6 text-primary flex items-center">
            {{domain.domain}}
            <button
              class="btn btn-icon btn-xs hover:text-primary ml-2"
              @click="openNewTab(domain.domain)"
              >
                <i class="fas fa-external-link-square-alt" />
            </button>
          </div>
          <div
            class="cursor-pointer text-danger font-semibold"
            @click="removeDomain(domain)"
          >
            <i class="el-icon-delete-solid"></i>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
    };
  },
  asyncComputed: {
    excludedDomains: {
      async get() {
        return await this.$storageService.get('neverDomains') || [];
      },
      watch: [
        '$store.state.syncedExcludeDomains'
      ]
    }
  },
  methods: {
  },
});
</script>
