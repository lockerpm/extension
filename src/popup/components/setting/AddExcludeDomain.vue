<template>
  <el-dialog
    :visible.sync="visible"
    :title="$t('common.add_url')"
    width="85%"
    destroy-on-close
    append-to-body
    custom-class="locker-dialog"
  >
    <div class="text-left">
      <ValidationProvider
        v-slot="{ errors: err }"
        rules="required"
        :name="$t('common.add_url')"
      >
        <InputText
          v-model="url"
          class="w-full"
          required
          :disabled="callingAPI"
          :bottom-border="true"
          :label="'EX: google.com'"
          :error-text="err && err.length && err[0]"
        />
      </ValidationProvider>
    </div>
    <div slot="footer" class="dialog-footer flex items-center justify-end">
      <div>
        <el-button
          size="small"
          :disabled="callingAPI"
          @click="visible = false"
        >
          {{ $t('common.cancel') }}
        </el-button>
        <el-button
          size="small"
          type="primary"
          :loading="callingAPI"
          :disabled="!url"
          @click="handleAddExcludeDomain"
        >
          {{ $t('common.add') }}
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import InputText from '@/components/input/InputText'
import { ValidationProvider } from 'vee-validate'

export default Vue.extend({
  components: {
    InputText,
    ValidationProvider
  },
  data () {
    return {
      url: '',
      callingAPI: false,
      visible: false,
      errors: {},
    }
  },
  methods: {
    openDialog () {
      this.visible = true
      this.url = ''
    },
    async handleAddExcludeDomain() {
      this.callingAPI = true
      await this.addExcludeDomain(this.url, () => this.visible = false)
      this.callingAPI = false
    }
  }
}
)
</script>
