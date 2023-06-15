<template>
  <div>
    <div v-for="(field, index) in value" :key="index">
      <div class="flex">
        <div class="self-center mr-3">
          <i
            class="el-icon-remove-outline cursor-pointer text-head-5"
            style="color: #dc2626"
            @click="deleteField(index)"
          />
        </div>
        <InputField
          v-model="field.value"
          :label="field.name"
          class="w-full"
          :is-date="field.type === CipherType.CryptoWallet"
          :placeholder="field.type === 8 ? 'mm/yyyy' : $t('data.ciphers.value')"
          :is-password="field.type === FieldType.Hidden"
          @input-label="(l) => updateField(index, {name: l, value: field.value})"
          @input="(v) => updateField(index, {name: field.name, value: v})"
        />
      </div>
    </div>

    <!-- Add new custom field -->
    <div>
      <el-dropdown trigger="click">
        <span class="el-dropdown-link text-primary">
          <i class="el-icon-circle-plus-outline mr-2" />{{ $t('data.ciphers.new_custom_field') }}
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="option in fieldTypeOptions"
            :key="option.value"
            :value="option.value"
            @click.native="addNewField(option.value)"
          >
            {{ option.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { FieldView } from 'jslib-common/models/view/fieldView'
import { FieldType } from 'jslib-common/enums/fieldType'
import { CipherType } from "jslib-common/enums/cipherType";

import InputField from './InputField.vue'
import Vue from 'vue'
export default Vue.extend ({
  components: {
    InputField
  },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    editMode: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      CipherType,
      fieldTypeOptions: [
        {
          label: this.$t('data.ciphers.text'),
          value: FieldType.Text
        },
        {
          label: this.$t('data.ciphers.hidden'),
          value: FieldType.Hidden
        },
        {
          label: 'URL',
          value: 4
        },
        {
          label: 'Email',
          value: 5
        },
        {
          label: this.$t('data.ciphers.address'),
          value: 6
        },
        {
          label: this.$t('data.ciphers.date'),
          value: 7
        },
        {
          label: this.$t('data.ciphers.monthYear'),
          value: 8
        },
        {
          label: this.$t('data.ciphers.phone'),
          value: 9
        }
      ],
      FieldType,
      type: FieldType.Text
    }
  },
  methods: {
    addNewField (type) {
      const newField = new FieldView()
      newField.type = type
      this.$emit('set-fields', { value: newField })
    },
    updateField (index, value) {
      this.$emit('set-fields', { index, value })
    },
    deleteField (index) {
      this.$emit('set-fields', { index, remove: true })
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
