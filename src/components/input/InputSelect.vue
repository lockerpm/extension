<template>
  <div
    class="cs-field"
    :class="{'is-focus': focusing,
             'have-value': value === null || value !== '',
             'is-hover': hovering,
             'is-error': errorText,
             'is-disabled': disabled,
    }"
  >
    <label>{{ label }}<span v-if="required" class="text-danger">*</span></label>
    <el-select
      v-model="value"
      :placeholder="placeholder"
      class="cs-select w-full"
      :disabled="disabled"
      @focus="handleFocus"
      @blur="focusing = false"
      @change="handleChange"
    >
      <el-option
        v-for="(item, index) in options"
        :key="index"
        :label="item[keyLabel]"
        :value="item[keyValue]"
      />
    </el-select>
    <button v-if="focusing || (value === null || value !== '')" class="btn btn-icon btn-select !py-0">
      <svg
        width="8px"
        height="13px"
        viewBox="0 0 8 13"
        version="1.1"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          id="Combined-Shape-Copy-4"
          d="M6.8423 3.8414L3.86416 0.183792Q3.79309 0.0965059 3.69143 0.0481835Q3.58977 -0.000138878 3.47721 -0.000138882Q3.36465 -0.000138886 3.26299 0.0481835Q3.16133 0.096506 3.09025 0.183792L0.112114 3.8414Q0.0674298 3.89628 0.0397669 3.96142Q0.0121041 4.02656 0.00364464 4.09682Q-0.0048148 4.16708 0.00659636 4.23693Q0.0180075 4.30677 0.0483893 4.37069Q0.078771 4.4346 0.125727 4.48755Q0.172683 4.5405 0.23251 4.57831Q0.292338 4.61611 0.360317 4.63579Q0.428297 4.65547 0.499067 4.65547L6.45535 4.65547Q6.52612 4.65547 6.5941 4.63579Q6.66208 4.61611 6.7219 4.57831Q6.78173 4.5405 6.82869 4.48755Q6.87564 4.4346 6.90602 4.37069Q6.93641 4.30677 6.94782 4.23693Q6.95923 4.16708 6.95077 4.09682Q6.94231 4.02656 6.91465 3.96142Q6.88698 3.89628 6.8423 3.8414ZM0.111803 7.80655L3.08994 11.4642Q3.16101 11.5514 3.26267 11.5998Q3.36433 11.6481 3.47689 11.6481Q3.58946 11.6481 3.69112 11.5998Q3.79278 11.5514 3.86385 11.4642L6.84199 7.80655Q6.88667 7.75167 6.91434 7.68653Q6.942 7.62139 6.95046 7.55113Q6.95892 7.48087 6.94751 7.41102Q6.93609 7.34118 6.90571 7.27726Q6.87533 7.21334 6.82837 7.16039Q6.78142 7.10745 6.72159 7.06964Q6.66176 7.03184 6.59379 7.01216Q6.52581 6.99248 6.45504 6.99248L0.498756 6.99248Q0.427986 6.99248 0.360006 7.01216Q0.292027 7.03184 0.232199 7.06964Q0.172372 7.10745 0.125416 7.1604Q0.0784599 7.21334 0.0480781 7.27726Q0.0176964 7.34118 0.00628522 7.41102Q-0.00512593 7.48087 0.0033335 7.55113Q0.0117929 7.62139 0.0394558 7.68653Q0.0671186 7.75167 0.111803 7.80655Z"
          transform="translate(0.5 0.5)"
          fill="#072245"
          fill-rule="evenodd"
          stroke="none"
        />
      </svg>
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
    disabled: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    initialValue: {
      type: [String, Number, Object, Array],
      default: ''
    },
    options: {
      type: Array,
      default () {
        return []
      }
    },
    keyKey: {
      type: String,
      default: 'id'
    },
    keyValue: {
      type: String,
      default: 'value'
    },
    keyLabel: {
      type: String,
      default: 'label'
    }
  },
  data () {
    return {
      focusing: false,
      hovering: false,
      type: 'text',
      value: ''
    }
  },
  computed: {
    shouldShowPlaceHolder () {
      return this.placeholder && this.focusing && !this.value
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.value = this.initialValue
    })
  },
  methods: {
    handleFocus () {
      if (this.disabled) { return }
      this.focusing = true
    },
    handleHover () {
      if (this.disabled) { return }
      this.hovering = true
    },
    handleChange (value) {
      if (this.disabled) { return }
      this.$emit('change', value)
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
  border: solid 1px #e6e8f4;
  padding-top: 16px;
  border-radius: 8px;
  &.is-hover, &.is-focus {
    @apply border-primary;
    label {
      @apply text-primary
    }
  }
  &.is-error {
    @apply border-danger mb-4 last:mb-8;
    label, .cs-helper-text {
      @apply text-danger
    }
  }
  &.is-focus label, &.have-value label {
    font-size: 12px;
    line-height: 19px;
    top: 5px;
    left: 11px;
  }
  &.is-disabled {
    cursor: not-allowed;
    input, button, input:hover, button:hover {
      cursor: not-allowed!important;
      user-select: none;
    }
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
  .btn-select {
    position: absolute;
    right: 6px;
    bottom: 5px;
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
