<template>
  <div>
    <!-- <div class="">
      <div class="flex items-center bg-black-300 cursor-pointer h-[44px] leading-[44px] px-5"
           @click="$router.back()"
      >
        <div class="menu-icon mr-4">
          <i class="fas fa-chevron-left text-[20px]"></i>
        </div>
        <div class="flex-grow">
          Back
        </div>
      </div>
    </div> -->
    <PasswordGenerator />
  </div>
</template>

<script>
import Vue from 'vue'
import PasswordGenerator from '@/popup/components/password/PasswordGenerator'
export default Vue.extend({
  components: { PasswordGenerator },
  data() {
    return {}
  },
  mounted: {}
})
</script>

<style lang="scss" scoped>

</style>
