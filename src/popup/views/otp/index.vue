<template>
  <div
    class="relative mx-auto settings-body bg-white"
  >
    <ListOTP
      v-if="!addEditOTP"
      @add-edit="handleAddEditOTP"
    />
    <AddEditOTP
      v-else
      :item="selectedOTP"
      @close="addEditOTP = false"
    />
  </div>
</template>

<script>
import Vue from 'vue'
import ListOTP from '@/popup/components/otp/ListOTP.vue';
import AddEditOTP from '@/popup/components/otp/AddEditOTP.vue';
export default Vue.extend({
  name: 'OTP',
  components: { ListOTP, AddEditOTP },
  data () {
    return {
      addEditOTP: false,
      selectedOTP: null
    }
  },
  methods: {
    handleAddEditOTP (item) {
      this.selectedOTP = item || null;
      this.addEditOTP = true;
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
