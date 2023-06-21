<template>
  <div v-loading="$store.state.syncing">
    <ListOTP
      v-if="!addEditOTP"
      @edit-otp="editOTP"
    />
    <AddEditOTP
      key="otp"
      ref="addEditOTP"
    />
  </div>
</template>

<script>
import Vue from 'vue'
import ListOTP from '@/popup/components/otp/ListOTP.vue';
import AddEditOTP from '@/popup/components/otp/AddEditOTP.vue';

export default Vue.extend({
  name: 'OTP',
  components: {
    ListOTP,
    AddEditOTP
  },
  data () {
    return {
    }
  },
  methods: {
    editOTP (otp) {
      this.$refs.addEditOTP?.openDialog(otp)
    },
  }
})
</script>

<style lang="scss">
</style>
