<template>
  <div class="flex flex-grow flex-col" style="align-items: center">
    <slot></slot>
  </div>
</template>

<script>
import Vue from 'vue'
export default Vue.extend( {
  created () {
    if(this.$route.query.source === 'id.cystack.net'){
      this.notify('Locker has been logged in. Now you can use Locker extension by clicking the icon from toolbar', 'success')
    }
  },
  name: 'BlankLayout'
})
</script>
