<template>
  <div
    class="relative mx-auto"
    style="background: #F6F6F6; min-height: 600px; max-width: 400px"
  >
    <ShowHeader />
    <router-view />
  </div>
</template>

<script>
import Vue from 'vue'
import ShowHeader from "./components/ShowHeader.vue";

export default Vue.extend({
  components: {
    ShowHeader
  },
  data () {
    return {
    }
  },
  asyncComputed: {
  },
  computed: {
  },
  methods: {
  }
}
)
</script>
<style>
</style>
