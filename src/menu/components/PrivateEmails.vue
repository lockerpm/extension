<template>
  <div class="private-emails">
    <div>
      <div v-if="aliases.length === 0" class="text-gray px-4 py-2 flex items-center justify-center" style="height: 200px;">
        {{ $t('hide_your_email.no_alias') }}
      </div>
      <div v-else class="private-emails--list px-4 py-2" style="height: 200px; overflow-y: auto;">
        <div v-for="alias in aliases" :key="alias.id">
          <p
            class="cursor-pointer hover:text-primary py-1"
            @click="() => { fillUsername(alias.full_address) }"
          >
            {{ alias.full_address }}
          </p>
        </div>
      </div>
      <div class="px-4">
        <div class="w-full" style="border-top: 1px solid rgba(230, 230, 232, 1);"></div>
      </div>
      <div class="px-4 py-2">
        <p
          class="text-primary cursor-pointer font-semibold"
          @click="() => { handleAddAddress() }"
        >
          {{$t('hide_your_email.generate_new')}}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { BrowserApi } from "@/browser/browserApi";
import { CipherType } from "jslib-common/enums/cipherType";

export default  Vue.extend({
  props: {
  },
  data () {
    return {
      aliases: [],
    }
  },
  beforeMount() {
    this.getAlias()
  },
  methods: {
    async getAlias() {
      const aliasesString = await this.$storageService.get('privateEmails');
      this.aliases = aliasesString ? JSON.parse(aliasesString) : []
    },
    fillUsername(address) {
      this.fillCipher({ type: CipherType.Login,  login: { username: address } })
      setTimeout(() => {
        this.getAlias();
      }, 2000);
    },
    async handleAddAddress() {
      const browserTab = await BrowserApi.getTabFromCurrentWindow();
      BrowserApi.tabSendMessageData(browserTab, 'createPrivateEmail', { isFill: true})
    }
  }
})
</script>

<style lang="scss">
</style>
