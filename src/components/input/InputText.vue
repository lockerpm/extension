<template>
  <div
    class="cs-field"
    :class="{'is-focus': focusing,
             'have-value': value,
             'is-hover': hovering,
             'is-password': isPassword,
             'is-error': errorText,
             'is-disabled': disabled,
    }"
  >
    <label for="">{{ label }} <span v-if="required" class="text-danger">*</span></label>
    <template v-if="isTextarea">
      <textarea
        ref="textarea"
        class="cs-textarea"
        :placeholder="shouldShowPlaceHolder ? placeholder : ''"
        :disabled="disabled"
        @mouseleave="hovering = false"
        @focus="focusing = true"
        @blur="focusing = false"
        @input="handleInput"
        @mouseenter="hovering = true"
      />
    </template>
    <template v-else>
      <input
        ref="input"
        class="cs-input"
        :type="type"
        :placeholder="shouldShowPlaceHolder ? placeholder : ''"
        :disabled="disabled"
        :value="value"
        tabindex="0"
        @mouseleave="hovering = false"
        @focus="handleFocus"
        @blur="focusing = false"
        @input="handleInput"
        @mouseenter="handleHover"
        @keyup.enter="handleEnterKeyup"
      >
    </template>

    <button
      v-if="isPassword && value"
      class="btn btn-icon"
      type="button"
      tabindex="-1"
      @click="togglePassword"
    >
      <i
        class="far"
        :class="{'fa-eye': type==='password', 'fa-eye-slash': type==='text'}"
      />
    </button>
    <div v-if="errorText" class="cs-helper-text">
      {{ errorText }}
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
export default Vue.extend({
  props: {
    isPassword: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    },
    errorText: {
      type: [String, Boolean, Number],
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    isTextarea: {
      type: Boolean,
      default: false
    },
    value: {
      type: [String, Number],
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      focusing: false,
      hovering: false,
      type: 'text'
    }
  },
  computed: {
    shouldShowPlaceHolder () {
      return this.placeholder && this.focusing && !this.value
    },
    nativeInputValue () {
      return this.value === null || this.value === undefined ? '' : String(this.value)
    }
  },
  watch: {
    nativeInputValue () {
      this.setNativeInputValue()
    }
  },
  mounted () {
    if (this.isPassword) {
      this.type = 'password'
    }
    this.$nextTick(() => {
      this.setNativeInputValue()
    })
  },
  methods: {
    togglePassword () {
      if (this.disabled) { return }
      this.type = this.type === 'text' ? 'password' : 'text'
    },
    setNativeInputValue () {
      const input = this.getInput()
      if (!input) return
      if (input.value === this.nativeInputValue) return
      input.value = this.nativeInputValue
    },
    getInput () {
      return this.$refs.input || this.$refs.textarea
    },
    handleInput (event) {
      if (event.target.value === this.nativeInputValue) return

      this.$emit('input', event.target.value)
      this.$nextTick(this.setNativeInputValue)
    },
    handleFocus () {
      if (this.disabled) { return }
      this.focusing = true
    },
    handleHover () {
      if (this.disabled) { return }
      this.hovering = true
    },
    handleEnterKeyup() {
      this.$emit('done')
    }
  }
})
</script>

<style scoped lang="scss">
.cs-field {
  //width: 100%;
  min-height: 48px;
  @apply mb-2.5 last:mb-6;
  display: flex;
  position: relative;
  border-radius: 2px;
  border: solid 1px #e6e8f4;
  padding-top: 16px;
  background-color: #fff;
  border-radius: 8px;
  &.is-hover, &.is-focus {
    @apply border-primary bg-white;
    label {
      @apply text-primary
    }
  }
  &.is-error {
    @apply border-danger mb-8 last:mb-8 #{!important};
    label, .cs-helper-text {
      @apply text-danger
    }
  }
  &.is-password.is-focus, &.is-password.have-value {
    button.btn {
      @apply absolute p-0.5;
      top: 19px;
      right: 13px;
    }
    .cs-input {
      padding-right: 48px;
    }
  }
  &.is-focus label, &.have-value label {
    font-size: 12px;
    line-height: 19px;
    top: 5px;
    left: 11px;
  }
  &.is-focus .cs-textarea, &.have-value .cs-textarea {
    margin-top: 8px;
    padding-top: 8px;
  }
  &.is-disabled {
    cursor: not-allowed;
    input, button, input:hover, button:hover {
      cursor: not-allowed!important;
      user-select: none;
    }
  }
  .cs-input, .cs-textarea {
    padding-bottom: 0px;
    padding-top: 0px;
    font-size: 14px;
    line-height: 19px;
    border: none;
    flex: 1;
    color: #161922;
    height: 32px;
    background-color: inherit;
    border-radius: 12px;
    width: 100%;
  }
  .cs-textarea {
    min-height: 100px;
    resize: vertical;
    max-height: 230px;
    padding-left: 12px;
    padding-right: 12px;
  }
  .cs-helper-text {
    height: 20px;
    position: absolute;
    bottom: -22px;
    font-size: 12px;
    transition: .3s cubic-bezier(.4,0,.2,1);
  }
  label {
    font-size: 14px;
    color: #90A0C1;
    position: absolute;
    top: 15px;
    left: 13px;
    pointer-events: none;
    transition: .4s cubic-bezier(.25,.8,.25,1);
    transition-duration: .3s;
    line-height: 19px;
    user-select: none;
  }
}
</style>
