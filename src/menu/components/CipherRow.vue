<template>
  <div>
    <li
      v-if="item.id"
      class="cipher-item"
      @click.self="() => fillCipher(item, fillType.value === 0)"
    >
      <div
        class="text-[32px] mr-3 flex-shrink-0"
        :class="{'filter grayscale': item.isDeleted}"
        @click="() => fillCipher(item, fillType.value === 0)"
      >
        <Vnodes :vnodes="getIconCipher(item, 32)" />
      </div>
      <div
        class="flex-grow overflow-hidden"
        @click="() => fillCipher(item, fillType.value === 0)"
      >
        <div
          class="text-black font-semibold truncate"
          style="line-height: 18px;"
        >
          {{ item.name }}
        </div>
        <div
          class="truncate text-gray"
          style="line-height: 16px;"
        >
          <small>
            {{ item.subTitle }}
          </small>
        </div>
      </div>
      <div v-if="fillType.value === 0" class="col-actions">
        <el-button
          class="btn-icon"
          :title="item.favorite ? $t('data.ciphers.markNotFavorite') : $t('data.ciphers.markFavorite')"
          type="text"
          @click="() => putCipher()"
        >
          <img :src="require(`@/assets/images/icons/${item.favorite ? 'icon_unpin' : 'icon_pin'}.svg`)" alt="">
        </el-button>
      </div>
    </li>
  </div>
</template>

<script>
import Vue from 'vue'
import {CipherType} from "jslib-common/enums/cipherType";
import Vnodes from "@/popup/components/Vnodes.vue";
import { CipherView } from 'jslib-common/models/view/cipherView';
import { CipherRequest } from 'jslib-common/models/request/cipherRequest';
import { CipherResponse } from 'jslib-common/models/response/cipherResponse';
import { CipherData } from 'jslib-common/models/data/cipherData';

import cystackPlatformAPI from '@/api/cystack_platform';

export default Vue.extend(
  {
    components: {
      Vnodes
    },
    props: {
      item:{
        type: [CipherView, Object],
        default: () => new CipherView()
      },
      fillType: {
        type: Object,
        default: () => ({})
      }
    },
    data(){
      return {
        CipherType,
        callingAPI: false,
        cipher: this.item,
      }
    },
    methods: {
      async putCipher () {
        this.cipher.favorite = !this.cipher.favorite
        const newCipher = await this.$cipherService.encrypt(this.cipher);
        const data = new CipherRequest(newCipher)
        try {
          const res = await cystackPlatformAPI.update_cipher(this.cipher.id, data)
          const cipherResponse = new CipherResponse(res)
          const userId = await this.$userService.getUserId();
          const cipherData = new CipherData(cipherResponse, userId);
          await this.$cipherService.upsert(cipherData);
          this.$store.commit("UPDATE_SYNCED_CIPHERS");

          this.notify(this.$tc('data.notifications.update_success', 1, { type: this.$tc(`type.${this.cipher.type}`, 1) }), 'success')
        } catch (e) {
          if (e.response && e.response.data && e.response.data.code === '3003') {
            this.notify(this.$t('errors.3003'), 'error')
          } else {
            this.notify(this.$tc('data.notifications.update_failed', 1, { type: this.$tc(`type.${this.cipher.type}`, 1) }), 'warning') 
          }
        }
      },
    }
  }
)
</script>

<style lang="scss" scoped>
</style>
