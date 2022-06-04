<template>
  <div class="grid grid-cols-3 gap-2">
    <div 
      class="cs-field"
      v-for="(w, index) in words.filter((w, index) => !!w.trim() || index < wordCount)" 
      :key="index"
    >
      <div style="align-self:center">
        {{`${index + 1}.`}}
      </div>
      <input
      class="cs-input"
      :ref="index"
      :value="w"
      type="text"
      @input="handleChange($event.target.value, index)"
      @keyup.enter="handleEnter($event, index)"
    />
    </div>
    
    <div v-if="wordCount<24">
      <button class="btn btn-default h-10 w-full" @click="handlePress">
        <div>
          <i class="el-icon-circle-plus-outline" /> {{ $t('common.add') }}
        </div>
      </button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
const MAX_WORD_COUNT = 24
const MIN_WORD_COUNT = 12
export default Vue.extend ({
  props: {
    value: {
      type: String,
      default: ''
    },
    editMode: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      wordCount: this.editMode ? Math.max(this.value.trimEnd().split(' ').length, MIN_WORD_COUNT) : MIN_WORD_COUNT,
      maxWidth: 0
    }
  },
  computed: {
    words () {
      const res = this.value.split(' ').map(w => w ? w.trim() : '')
      while (res.length < MAX_WORD_COUNT) {
        res.push('')
      }
      return res
      // return this.value.split(' ').map(w => w ? w.trim() : '')
    },
    refs () {
      return this.words.map((item, index) => `${item}${index}`)
    }
  },
  methods: {
    handlePress(){
      if(this.wordCount < 24) {
        this.wordCount = this.wordCount + 1
      }
    },
    handleChange (val, index) {
      const res = [...this.words]
      const ws = val.trim().split(' ')
      if (val === '') {
        res[index] = ''
        // this.handleEmpty()
      } else {
        ws.forEach((w, i) => {
          if (w.trim() && index + i < MAX_WORD_COUNT) {
            res[index + i] = w.trim()
          }
        })
      }

      this.$emit('set-seed', res.join(' '))
      if (ws.length > 1 && index + ws.length - 1 < MAX_WORD_COUNT) {
        if (index + ws.length > this.wordCount) {
          this.wordCount = index + ws.length
        }
        setTimeout(() => {
          this.$refs[index + ws.length - 1].current?.focus()
        }, 0)
      } else if (val.endsWith(' ') && index + 1 < MAX_WORD_COUNT) {
        if (index + 1 === this.wordCount) {
          this.wordCount = this.wordCount + 1
        }
        setTimeout(() => {
          this.$refs[index + 1][0].focus()
        }, 0)
      }
    },
    handleEmpty (index) {
      if (index > 0) {
        setTimeout(() => {
          this.$refs[index - 1][0].focus()
        }, 0)
      }
      if (index + 1 > MIN_WORD_COUNT) {
      // setWordCount(wordCount - 1)
        this.wordCount = this.wordCount - 1
      }
    },
    handleEnter (event, index) {
      if (index + 1 === this.wordCount) {
        this.handlePress()
      }
      setTimeout(() => {
        this.$refs[index + 1][0].focus()
      }, 0)
    }
  }
})
</script>

<style lang="scss" scoped>
.cs-field {
  //width: 100%;
  height: 40px;
  display: flex;
  padding-left: 12px;
  position: relative;
  border-radius: 2px;
  border: solid 1px #e6e8f4;
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
    padding-top: 8px;
    margin-top: 8px;
  }
  &.is-disabled {
    cursor: not-allowed;
    input, button, input:hover, button:hover {
      cursor: not-allowed!important;
      user-select: none;
    }
  }
  .cs-input, .cs-textarea {
    align-self: center;
    padding-left: 2px !important;
    width: 100%;
    padding-bottom: 0px;
    padding-top: 0px;
    font-size: 14px;
    line-height: 19px;
    border: none;
    flex: 1;
    color: #161922;
    height: 32px;
    background-color: inherit;
  }
}
</style>
