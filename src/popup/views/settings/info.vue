<template>
  <div>
    <div class="text-black text-head-6 font-semibold pb-4">
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
</template>

<script lang="ts">
import Vue from "vue";
import { VAULT_TIMEOUTS } from '@/config/constants'

export default Vue.extend({
  data() {
    return {
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
  methods: {
  },
});
</script>
