<template>
  <div
    class="relative mx-auto settings-body bg-white"
  >
    <Header></Header>
    <ListOTP
      v-if="!addEditOTP"
      @add-edit="handleAddEditOTP"
    />
    <AddEditOTP
      v-else
      :item="selectedOTP"
      @close="addEditOTP = false"
    />
    <Footer></Footer>
  </div>
</template>

<script>
import Vue from 'vue'
import Header from "@/popup/components/layout/parts/Header";
import ListOTP from '@/popup/components/otp/ListOTP.vue';
import AddEditOTP from '@/popup/components/otp/AddEditOTP.vue';
import Footer from "@/popup/components/layout/parts/Footer";
export default Vue.extend({
  name: 'OTP',
  components: { Header, ListOTP, AddEditOTP, Footer },
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
