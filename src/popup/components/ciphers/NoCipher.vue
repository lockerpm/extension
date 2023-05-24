<template>
  <div class="flex-column-fluid flex items-center justify-center">
    <div class="text-center mt-10">
      <!-- <div class="mb-5 p-5">
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
      </div> -->
      <div class="mb-5">
        <img class="mx-auto" src="@/assets/images/icons/Lock.png">
      </div>
      <div class="text-black text-head-6 mb-4" v-html="$t('data.no_data.common.title')">
      </div>
      <div>
        <button
          v-if="shouldRenderBtn"
          class="btn btn-primary"
          @click="$emit('add-cipher')"
        >
          {{$t('data.no_data.common.btn')}}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import {CipherType} from "jslib-common/enums/cipherType";
export default Vue.extend({
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
