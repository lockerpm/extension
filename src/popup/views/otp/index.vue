<template>
  <div class="otp-body">
    <div
      class="p-4"
      v-loading="$store.state.syncing"
    >
      <ListOTP
        v-if="!addEditOTP"
      />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import ListOTP from '@/popup/components/otp/ListOTP.vue';
export default Vue.extend({
  name: 'OTP',
  components: { ListOTP },
  data () {
    return {
    }
  },
  methods: {
  }
})
</script>

<style lang="scss">
.otp-body {
  position: absolute !important;
  top: 125px !important;
  bottom: 0 !important;
  width: 100% !important;
  overflow: auto !important;
}
</style>
