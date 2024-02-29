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
          @click="() => $emit('put-cipher')"
        >
          <img :src="require(`@/assets/images/icons/${item.favorite ? 'icon_unpin' : 'icon_pin'}.svg`)" alt="">
        </el-button>
      </div>
    </li>
  </div>
</template>

<script>
import Vue from 'vue'
import Vnodes from "@/popup/components/Vnodes.vue";

import { CipherType } from "jslib-common/enums/cipherType";
import { CipherView } from 'jslib-common/models/view/cipherView';

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
      
    }
  }
)
</script>

<style lang="scss" scoped>
</style>
