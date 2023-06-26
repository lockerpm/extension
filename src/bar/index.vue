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
      />
      <BarFooter
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
import { CipherResponse } from 'jslib-common/models/response/cipherResponse';
import { CipherData } from 'jslib-common/models/data/cipherData';

export default Vue.extend({
  name: 'Bar',
  components: {
    BarHeader,
    BarForm,
    BarFooter
  },
  data () {
    return {
      data: { ...this.$route.query || {}, folderId: null }
    }
  },
  asyncComputed: {
  },
  computed: {
  },
  methods: {
    async close() {
      const tab = await BrowserApi.getTabFromCurrentWindow();
      BrowserApi.tabSendMessageData(tab, 'closeNotificationBar')
    },
    async handleSave() {
      this.$refs.barForm.$refs.form.validate((valid) => {
        if (valid) {
          if (this.data.id) {
            this.updateCipher()
          } else {
            this.createCipher()
          }
        }
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
      model.name = Utils.getHostname(this.data.uri);
      model.name = model.name.replace(/^www\./, '');
      model.type = CipherType.Login;
      model.login = loginModel;
      model.folderId = data.folderId

      const cipher = await this.$cipherService.encrypt(model);
      const data = new CipherRequest(cipher)
      try {
        const res = await cystackPlatformAPI.create_ciphers_vault(data);
        const cipherResponse = new CipherResponse({ ...data, id: res ? res.id : '' })
        const userId = await this.$userService.getUserId();
        const cipherData = new CipherData(cipherResponse, userId)
        this.$cipherService.upsert(cipherData)
        this.notificationAlert('password_added')
        this.close()
      } catch (e) {
        if (e.response && e.response.data && e.response.data.code === '5002') {
          this.notificationAlert('password_limited')
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
          const res = await cystackPlatformAPI.update_cipher(cipher.id, data)
          const cipherResponse = new CipherResponse(res)
          const userId = await this.$userService.getUserId();
          const cipherData = new CipherData(cipherResponse, userId);
          await this.$cipherService.upsert(cipherData);
          this.notificationAlert('username_password_updated');
          this.close()
        } catch (e) {
          //
        }
      }
        
    },
    async excludeDomain() {
      //
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
