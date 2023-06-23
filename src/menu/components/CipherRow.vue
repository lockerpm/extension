<template>
  <div>
    <li
      v-if="item.id"
      class="cipher-item"
      @click.self="() => fillCipher(item)"
    >
      <div
        class="text-[32px] mr-3 flex-shrink-0"
        :class="{'filter grayscale': item.isDeleted}"
        @click="() => fillCipher(item)"
      >
        <Vnodes :vnodes="getIconCipher(item, 32)" />
      </div>
      <div
        class="flex-grow overflow-hidden"
        @click="() => fillCipher(item)"
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
    </li>
  </div>
</template>

<script>
import Vue from 'vue'
import {CipherType} from "jslib-common/enums/cipherType";
import Vnodes from "@/popup/components/Vnodes.vue";
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
      }
    },
    data(){
      return {
        CipherType
      }
    }
  }
)
</script>

<style lang="scss" scoped>
</style>
