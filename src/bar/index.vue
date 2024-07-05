<template>
  <div class="h-full w-full">
    <BarHeader
      :data="data"
      @close="closeBar"
    />
    <div class="bg-white p-4">
      <BarForm
        ref="barForm"
        :data="data"
        :disabled="callingAPI"
      />
      <BarFooter
        :callingAPI="callingAPI"
        @save="handleSave"
        @exclude="excludeDomain"
      />
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import BarHeader from './components/Header.vue';
import BarForm from './components/Form.vue';
import BarFooter from './components/Footer.vue';

import { CipherType } from "jslib-common/enums/cipherType";
import { BrowserApi } from "@/browser/browserApi";
import { LoginView } from 'jslib-common/models/view/loginView';
import { LoginUriView } from 'jslib-common/models/view/loginUriView';
import { CipherView } from 'jslib-common/models/view/cipherView';
import { Utils } from 'jslib-common/misc/utils';

export default Vue.extend({
  name: 'Bar',
  components: {
    BarHeader,
    BarForm,
    BarFooter
  },
  data () {
    return {
      callingAPI: false,
      data: {},
      browserTab: null
    }
  },
  asyncComputed: {
  },
  async mounted() {
    this.data = this.$store.state.initData?.data;
    this.browserTab = await BrowserApi.getTabFromCurrentWindow();
    await this.serviceWorkerUnlocked();
  },
  methods: {
    async closeBar() {
      const tab = await BrowserApi.getTabFromCurrentWindow();
      if (tab) {
        BrowserApi.tabSendMessageData(tab, 'closeNotificationBar')
      }
    },
    async handleSave() {
      this.$refs.barForm.$refs.form.validate(async (valid) => {
        this.callingAPI = true;
        if (valid) {
          if (this.data.id) {
            await this.updateCipher()
          } else {
            await this.createCipher()
          }
        }
        this.callingAPI = false;
      })
    },
    async createCipher() {
      const loginModel = new LoginView();
      const loginUri = new LoginUriView();
      loginModel.uris = [{ ...loginUri, uri: this.data.uri }];
      loginModel.username = this.data.username;
      loginModel.password = this.data.password;
      const model = new CipherView();
      model.name = this.data.domain
      model.type = CipherType.Login;
      model.login = loginModel;
      model.folderId = this.data.folderId
      if (this.browserTab) {
        await BrowserApi.tabSendMessageData(this.browserTab, 'createCipher', {
          payload: model,
        });
      }
      this.closeBar();
    },
    async updateCipher() {
      if (this.browserTab) {
        await BrowserApi.tabSendMessageData(this.browserTab, 'updateCipher', {
          payload: this.data,
        });
        this.closeBar();
      }
    },
    async excludeDomain() {
      if (this.browserTab) {
        await BrowserApi.tabSendMessageData(this.browserTab, 'addExcludeDomain', {
          domain: Utils.getDomain(this.browserTab.url),
        });
      }
      this.closeBar()
    },
    async serviceWorkerUnlocked() {
      const tab = await BrowserApi.getTabFromCurrentWindow();
      if (tab) {
        BrowserApi.tabSendMessage(tab, {
          command: "unlocked",
          tab: tab,
        });  
      }
    }
  }
})
</script>

<style lang="scss">
</style>
