<template>
  <div
    class="relative mx-auto settings-body bg-white"
  >
    <Header></Header>
    <ListOtp
      v-if="!createOtp"
      @create="createOtp = true"
    />
    <CreateOtp
      v-else
      @close="createOtp = false"
    />
    <Footer></Footer>
  </div>
</template>

<script>
import Vue from 'vue'
import Header from "@/popup/components/layout/parts/Header";
import ListOtp from '@/popup/components/otp';
import CreateOtp from '@/popup/components/otp/create';
import Footer from "@/popup/components/layout/parts/Footer";
export default Vue.extend({
  name: 'OTP',
  components: { Header, ListOtp, CreateOtp, Footer },
  data () {
    return {
      createOtp: false
    }
  } 
})
</script>

<style lang="scss" scoped>

</style>
