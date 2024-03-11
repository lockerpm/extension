<template>
  <div
    class="otp-item px-4 py-2 hover:bg-black-300 cursor-pointer"
    @click="fillOTP"
  >
    <el-row type="flex" justify="space-between">
      <ShowOTP
        justify="space-between"
        :name="item.name"
        :notes="item.notes"
        :is-copy="false"
      />
    </el-row>
  </div>
</template>

<script>
import ShowOTP from '@/popup/components/otp/ShowOTP.vue';
import { BrowserApi } from "@/browser/browserApi";

export default {
  components: { ShowOTP },
  props: {
    item: Object
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data () {
    return {
      otp: ''
    }
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async fillOTP () {
      const tab = await BrowserApi.getTabFromCurrentWindow();
      if (tab) {
        BrowserApi.tabSendMessage(tab, {
          command: 'collectPageDetails',
          tab: tab,
          sender: 'autofillOTP',
          cipher: this.item
        });
      }
      this.closeMenu();
    }
  }
}
</script>
<style lang="scss">
.otp-item {
  &:last-child {
    border-bottom: none;
  }
  &:last-child {
    border: none;
  }
}
</style>
