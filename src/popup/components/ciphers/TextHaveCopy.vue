<template>
  <div class="cipher-field" style="">
    <div class="">{{ label }}</div>
    <div class="flex justify-between">
      <div
        class="col-span-4 font-semibold"
        :style="`width: ${shouldHide ? '70%' : '90%'};`"
      >
        <div v-if="text&&textArea" class="word-wrap" v-html="text" />
        <span v-if="text&&!textArea" class="word-wrap">
          {{ text | filterPassword(showPassword) }}
        </span>
      </div>
      <div
        v-if="text&&viewPassword===true"
        class="text-right"
      >
        <button
          v-if="shouldHide"
          class="btn btn-icon btn-xs btn-action"
          @click="showPassword = !showPassword"
        >
          <i
            class="far"
            :class="{'fa-eye': !showPassword, 'fa-eye-slash': showPassword}"
          />
        </button>
        <button
          v-clipboard:copy="text"
          v-clipboard:success="clipboardSuccessHandler"
          class="btn btn-icon btn-xs btn-action"
        >
          <i class="far fa-copy" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
export default Vue.extend({
  props: {
    text: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    shouldHide: {
      type: Boolean,
      default: false
    },
    viewPassword: {
      type: Boolean,
      default: true
    },
    textArea: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      showPassword: false
    }
  },
  mounted () {
    this.showPassword = !this.shouldHide
  }
}
)
</script>
<style lang="scss">
.word-wrap {
  word-wrap: break-word;
}
</style>
