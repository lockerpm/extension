<template>
  <div class="">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import uuid from 'uuid';

export default Vue.extend({
  name: 'App',
  data () {
    return {
    }
  },
  computed: {
    previousPath () {
      return this.$store.state.previousPath
    }
  },
  async created () {
    (window as any).bitwardenPopupMainMessageListener = async (msg: any, sender: any, sendResponse: any) => {
      console.log(msg)
      console.log(sender)
      console.log(sendResponse)
    }
    await this.reconnectDesktopAppSocket();
  },
  methods: {
    async reconnectDesktopAppSocket () {
      this.$connect(process.env.VUE_APP_DESKTOP_WS_URL, {
        format: 'json',
      })
      this.ws2  = this.$socket;
      setTimeout(async () => {
        try {
          await this.ws2.sendObj({
            msgType: 1,
            clientId: uuid(),
          })
          this.desktopAppInstalled = true;
        } catch (error) {
          this.desktopAppInstalled = false;
        }
      }, 2000)
      this.ws2.onmessage = message => {
        const data = JSON.parse(message.data)
        this.desktopAppData = data;
      }
    }

  }
})
</script>

<style lang="scss">
.vault-body {
  position: absolute !important;
  top: 192px !important;
  bottom: 42px !important;
  width: 100% !important;
  overflow: auto !important;
}
.settings-body {
  position: absolute !important;
  top: 98px !important;
  bottom: 0px !important;
  width: 100% !important;
  overflow: auto !important;
}
.el-input {
  &__inner {
    border-radius: 8px !important;
  }
}
.el-button {
  border-radius: 8px !important;
}
.el-message-box {
  width: 260px !important;
}
</style>
