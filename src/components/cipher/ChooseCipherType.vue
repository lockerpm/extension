<template>
  <div>
    <el-dialog
      :visible.sync="dialogVisible"
      width="575px"
      destroy-on-close
      top="15vh"
      custom-class="locker-dialog"
      :close-on-click-modal="false"
    >
      <div slot="title">
        <div class="text-head-5 text-black-700 font-semibold truncate">
          {{ $t('data.ciphers.add_cipher') }}
        </div>
      </div>
      <div class="grid grid-cols-2 gap-8 pb-3">
        <div
          v-for="item in options"
          :key="item"
          class="py-8 rounded-[12px] flex flex-col items-center justify-center border border-black-200 cursor-pointer"
          :class="{
            'border-primary': type === item,
            'border-black-200': type !== item
          }"
          @click="confirmDialog(item)"
          @mouseover="type = item"
        >
          <img
            :src="require(`@/assets/images/icons/icon_${item}.svg`)"
            alt=""
            style="width: 70px; height: 70px"
          >
          <div class="text-black text-[20px] font-semibold mt-4">{{ $tc(`type.${item}`, 1) }}</div>
        </div>
      </div>
    </el-dialog>
    <AddEditCipher ref="addEditCipherDialog" :type="type" />
  </div>
</template>

<script>
import Vue from 'vue'
import AddEditCipher from '@/components/cipher/AddEditCipher'
export default Vue.extend({
  components: {
    AddEditCipher
  },
  props: {
  },
  data () {
    return {
      dialogVisible: false,
      type: 'Login',
      options: ['Login', 'SecureNote', 'Card', 'Identity']
    }
  },
  methods: {
    openDialog () {
      this.dialogVisible = true
    },
    closeDialog () {
      this.dialogVisible = false
    },
    confirmDialog (type) {
      this.type = type
      this.$refs.addEditCipherDialog.openDialog({})
      this.dialogVisible = false
    }
  }
})
</script>
