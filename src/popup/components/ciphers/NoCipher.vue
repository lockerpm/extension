<template>
  <div class="flex-column-fluid flex items-center justify-center">
    <div class="text-center mt-4">
      <div class="mb-5">
        <img
          class="mx-auto"
          style="width: 40px; height: 40px;"
          :src="require(`@/assets/images/icons/${currentIcon.icon}`)"
        >
      </div>
      <div
        class="text-black text-head-6 mb-1"
        v-html="$t(`data.no_data.${currentIcon.key}.title`)"
      >
      </div>
      <div
        class="text-gray mb-4"
        v-html="$t(`data.no_data.${currentIcon.key}.description`)"
      >
      </div>
      <div>
        <el-button
          @click="$emit('add-cipher')"
          size="small"
        >
          {{$t(`data.no_data.${currentIcon.key}.btn`)}}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { CipherType } from "jslib-common/enums/cipherType";
export default Vue.extend({
  props: {
    type: {
      type: [Number, String],
      default: CipherType.Login
    }
  },
  data () {
    return {
    }
  },
  computed: {
    cipherTypes() {
      return [
        {
          key: 'Login',
          icon: 'icon_Login.svg',
          value: CipherType.Login,
        },
        {
          key: 'SecureNote',
          icon: 'icon_SecureNote.svg',
          value: CipherType.SecureNote
        },
        {
          key: 'Card',
          icon: 'icon_Card.svg',
          value: CipherType.Card
        },
        {
          key: 'Identity',
          icon: 'icon_Identity.svg',
          value: CipherType.Identity
        },
        {
          key: 'OTP',
          icon: 'icon_OTP.svg',
          value: CipherType.OTP
        },
        {
          key: 'CryptoBackup',
          icon: 'icon_CryptoWallet.svg',
          value: CipherType.CryptoBackup
        },
        {
          key: 'Folder',
          icon: 'folder.svg',
          value: 0
        },
        {
          key: 'FolderItem',
          icon: 'icon_default.svg',
          value: 'folder_item'
        }
      ]
    },
    currentIcon() {
      return this.cipherTypes.find((icon) => icon.value == this.type)
    }
  }
}
)
</script>
