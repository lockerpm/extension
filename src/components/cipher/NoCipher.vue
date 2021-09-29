<template>
  <div class="flex-column-fluid flex items-center justify-center">
    <div class="text-center mb-60">
      <div class="mb-5 p-5">
        <Vnodes :vnodes="getIconCipher({type: CipherType[type] ? CipherType[type] : type}, 70)" />
      </div>
      <div class="text-head-5 font-semibold mb-2.5">
        {{ $t(`data.no_data.${type}.title`) }}
      </div>
      <div class="text-black-600 mb-8">
        {{ $t(`data.no_data.${type}.description`) }}
      </div>
      <div>
        <button
          v-if="shouldRenderBtn"
          class="btn btn-primary"
          @click="$emit('add-cipher')"
        >
          {{ $t(`data.no_data.${type}.btn`) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import {CipherType} from "jslib-common/enums/cipherType";
import Vnodes from '@/components/Vnodes'
export default Vue.extend({
  components: { Vnodes },
  props: {
    type: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      CipherType
    }
  },
  computed: {
    shouldRenderBtn () {
      return this.type !== 'Trash'
    },
    shouldRenderBtnImport () {
      return this.type === 'Login' || this.type === 'Vault'
    }
  }
}
)
</script>
