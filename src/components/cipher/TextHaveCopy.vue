<template>
  <div class="grid md:grid-cols-6 cipher-item">
    <div class="">{{ label }}</div>
    <div class="col-span-4 font-semibold">
      <span v-if="text">{{ text | filterPassword(showPassword) }}</span>
    </div>
    <div v-if="text&&viewPassword===true" class="text-right">
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
