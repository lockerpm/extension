<template>
  <div
    class="relative mx-auto"
    style="background: #F1F1F1; padding-bottom: 56px; padding-top: 44px; min-height: 600px; max-width: 400px"
  >
    <Header></Header>
    <PasswordGenerator />
    <Footer></Footer>
  </div>
</template>

<script>
import Vue from 'vue'
import PasswordGenerator from '@/popup/components/password/PasswordGenerator'
import Header from "@/popup/components/layout/parts/Header";
import Footer from "@/popup/components/layout/parts/Footer";
export default Vue.extend({
  components: { PasswordGenerator, Header, Footer },
  data() {
    return {}
  },
  mounted: {}
})
</script>

<style lang="scss" scoped>

</style>
