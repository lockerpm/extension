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
import { CipherRequest } from 'jslib-common/models/request/cipherRequest';
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
      loginUri.uri = this.data.uri;
      loginModel.uris = [loginUri];
      loginModel.username = this.data.username;
      loginModel.password = this.data.password;
      const model = new CipherView();
      model.name = this.data.domain
      model.type = CipherType.Login;
      model.login = loginModel;
      model.folderId = this.data.folderId
      const cipher = await this.$cipherService.encrypt(model);
      const data = new CipherRequest(cipher)
      if (this.browserTab) {
        await BrowserApi.tabSendMessageData(this.browserTab, 'createCipher', {
          payload: data,
        });
      }
      this.closeBar();
    },
    async updateCipher() {
      let cipher = await this.$cipherService.get(this.data.id);
      if (cipher && cipher.type === CipherType.Login) {
        cipher = await cipher.decrypt();
        cipher.login.password = this.data.password;
        cipher.login.username = this.data.username;
        const newCipher = await this.$cipherService.encrypt(cipher);
        const data = new CipherRequest(newCipher);
        if (this.browserTab) {
          await BrowserApi.tabSendMessageData(this.browserTab, 'updateCipher', {
            cipherId: this.data.id,
            payload: data,
          });
        }
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
    }
  }
})
</script>

<style lang="scss">
</style>
