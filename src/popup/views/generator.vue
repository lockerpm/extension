<template>
  <div
    class="relative mx-auto settings-body"
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
  components: { PasswordGenerator, Header, Footer }
})
</script>

<style lang="scss" scoped>

</style>
