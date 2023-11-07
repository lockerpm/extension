<template>
  <div class="h-full">
    <BarHeader
      :data="data"
      @close="close"
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
import cystackPlatformAPI from '@/api/cystack_platform';

import { CipherType } from "jslib-common/enums/cipherType";
import { BrowserApi } from "@/browser/browserApi";
import { LoginView } from 'jslib-common/models/view/loginView';
import { LoginUriView } from 'jslib-common/models/view/loginUriView';
import { CipherView } from 'jslib-common/models/view/cipherView';
import { Utils } from 'jslib-common/misc/utils';
import { CipherRequest } from 'jslib-common/models/request/cipherRequest';

export default Vue.extend({
  name: 'Bar',
  components: {
    BarHeader,
    BarForm,
    BarFooter
  },
  data () {
    return {
      data: { ...this.$route.query || {}, folderId: null },
      callingAPI: false
    }
  },
  asyncComputed: {
  },
  computed: {
  },
  methods: {
    async close() {
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
      model.name = this.data.uri
      model.type = CipherType.Login;
      model.login = loginModel;
      model.folderId = this.data.folderId

      const cipher = await this.$cipherService.encrypt(model);
      const data = new CipherRequest(cipher)
      try {
        await cystackPlatformAPI.create_ciphers_vault(data);
        this.close()
        this.notificationAlert('password_added')
      } catch (e) {
        if (e.response && e.response.data && e.response.data.code === '5002') {
          this.notificationAlert('password_limited')
        } else {
          this.notificationAlert('password_add_error')
        }
      }
    },
    async updateCipher() {
      let cipher = await this.$cipherService.get(this.data.id);
      if (cipher && cipher.type === CipherType.Login) {
        cipher = await cipher.decrypt();
        cipher.login.password = this.data.password;
        cipher.login.username = this.data.username;
        const newCipher = await this.$cipherService.encrypt(cipher);
        const data = new CipherRequest(newCipher)
        try {
          await cystackPlatformAPI.update_cipher(cipher.id, data)
          this.close()
          this.notificationAlert('username_password_updated');
        } catch (e) {
          this.notificationAlert('username_password_update_error');
        }
      }
        
    },
    async excludeDomain() {
      const tab = await BrowserApi.getTabFromCurrentWindow();
      await this.addExcludeDomain(tab.url);
      this.close()
    },
    async notificationAlert(type) {
      const tab = await BrowserApi.getTabFromCurrentWindow();
      BrowserApi.tabSendMessage(tab, {
        command: 'alert',
        tab: tab,
        type: type,
      });
    }
  }
})
</script>

<style lang="scss">
</style>
