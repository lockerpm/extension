<template>
  <div class="flex-column-fluid flex items-center justify-center">
    <div class="text-center mt-10">
      <div class="mb-5">
        <img class="mx-auto" src="@/assets/images/icons/Lock.png">
      </div>
      <div class="text-black text-head-6 mb-4" v-html="$t('data.no_data.common.title')">
      </div>
      <div>
        <button
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
  },
  data () {
    return {
      CipherType
    }
  },
  computed: {
  }
}
)
</script>
