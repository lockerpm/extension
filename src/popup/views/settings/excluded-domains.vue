<template>
  <div
    class="flex flex-col flex-grow relative h-screen"
    style="background: #F1F1F1; padding-top: 44px"
  >
    <div
      class="flex items-center cursor-pointer h-[44px] leading-[44px] px-5 justify-between fixed top-0 left-0 right-0 bg-white"
      style="z-index: 1"
    >
      <div
        class="menu-icon mr-4"
        @click="$router.back()"
      >
        <i class="fas fa-chevron-left text-[20px]"></i> Cancel
      </div>
      <div>Excluded Domains</div>
      <div
        @click="submit"
      >
        Save
      </div>
    </div>
    <div class="mt-4">
      <template v-for="(domain, index) in excludedDomains">
        <div
          :key="index"
          class="flex items-center hover:bg-[#E4F2E1] bg-white border-b border-black-400"
          style="padding: 12px 20px;"
        >
          <div class="cursor-pointer" @click="removeUri(index)"><i class="el-icon-remove text-danger mr-3"></i></div>
          <div>
            <div class="text-black-600">URI {{index + 1}}</div>
            <!-- <div class="text-black font-semibold">{{domain.uri}}</div> -->
            <input class="text-lg text-black font-semibold" placeholder="ex. https://google.com" v-model="domain.uri">
          </div>
        </div>
      </template>
      <div
        class="flex items-center hover:bg-[#E4F2E1] bg-white border-b border-black-400 cursor-pointer"
        style="padding: 12px 20px;"
        @click="addUri"
      >
        <div><i class="el-icon-circle-plus text-info mr-3"></i></div>
        <div>
           New URI
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ConstantsService } from 'jslib-common/services/constants.service'
import { Utils } from 'jslib-common/misc/utils'
export default Vue.extend({
  data () {
    return {
      excludedDomains: [],
      test: {
        name: ''
      },
      name: ''
    }
  },
  async mounted () {
    const savedDomains = await this.$storageService.get(ConstantsService.neverDomainsKey)
    if (savedDomains) {
      for(const uri of Object.keys(savedDomains)){
        this.excludedDomains.push({uri: uri, showCurrentUris: false})
      }
    }
  },
  methods: {
    async addUri() {
      this.excludedDomains.push({ uri: '', showCurrentUris: false });
    },
    async removeUri(i: number) {
      this.excludedDomains.splice(i, 1);
    },
    async submit() {
      const savedDomains: { [name: string]: null } = {};
      for (const domain of this.excludedDomains) {
        if (domain.uri && domain.uri !== '') {
          const validDomain = Utils.getHostname(domain.uri);
          if (!validDomain) {
            // this.platformUtilsService.showToast('error', null,
            //   this.i18nService.t('excludedDomainsInvalidDomain', domain.uri));
            this.notify(
              `${domain.uri || 'google.com'} is not a valid domain`,
              "error"
            );
            return;
          }
          savedDomains[validDomain] = null;
        }
      }
      await this.$storageService.save(ConstantsService.neverDomainsKey, savedDomains);
      this.$router.push({name: 'settings'});
    }
  }
})
</script>
