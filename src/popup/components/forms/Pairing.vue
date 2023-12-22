<template>
  <div class="w-full pairing-form">
    <div class="flex justify-center">
      <div v-if="isConnected && isDesktopConnected">
        <p class="mb-8 mt-4 text-left">
          {{$t('passwordless.pairing_required')}}
        </p>
        <el-card
          v-if="approveCode"
          class="mb-6 w-full flex justify-center"
          body-style="padding: 6px 24px"
        >
          <p class="font-semibold text-head-5">
            {{ approveCode }}
          </p>
        </el-card>
        <el-button
          v-if="approveCode"
          class="w-full"
          type="primary"
          :disabled="!pairingConfirmed"
          :loading="callingAPI"
          @click="confirmDesktopPairing"
        >
          {{$t('common.confirm')}}
        </el-button>
        <el-button
          v-else
          class="w-full"
          type="primary"
          @click="sendPairing"
        >
          {{$t('common.continue')}}
        </el-button>
        <div>
          <el-button
            v-if="approveCode"
            class="w-full mt-2"
            type="text"
            icon="el-icon-refresh"
            @click="sendPairing"
          >
            {{$t('passwordless.repair')}}
          </el-button>
        </div>
      </div>
      <div v-if="!isConnected">
        <p class="mb-8 mt-4">
          {{ $t('passwordless.install_desktop')}}
        </p>
        <el-button
          class="w-full"
          type="primary"
          @click="() => {}"
        >
          {{$t('common.download')}}
        </el-button>
      </div>
      <div v-else-if="!isDesktopConnected">
        <p class="mb-8 mt-4">
          {{ $t('passwordless.open_desktop')}}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="js">
import Vue from 'vue'
export default Vue.extend({
  props: {
    callingAPI: Boolean
  },
  data() {
    return {
    }
  },
  computed: {
    isConnected() { return this.$store.state.isConnected },
    isDesktopConnected() { return this.$store.state.isDesktopConnected },
    approveCode() { return this.$store.state.approveCode },
    pairingConfirmed() { return this.$store.state.pairingConfirmed },
    clientId() { return this.$store.state.clientId },
    clientType() { return this.$store.state.clientType }
  },
  mounted() {
    //
  },
  watch: {
  },
  methods: {
    sendPairing() {
      self.service.sendPairingRequest()
    },

    async confirmDesktopPairing() {
      try {
        await self.service.confirmDesktopPairing();
        this.$store.commit('UPDATE_APPROVE_CODE', null)
        this.$emit('confirm');
      } catch (error) {
        this.notify(error?.message || this.$t('common.system_error'), 'error')
      }
    },
  }
})
</script>

<style lang="scss">
</style>
