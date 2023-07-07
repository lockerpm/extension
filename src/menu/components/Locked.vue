<template>
  <div class="p-4">
    <div v-if="isLoggedIn" class="text-center">
      <p class="mb-3">
        {{ $t('menu.unlock_your_vault') }}
      </p>
      <el-button type="primary" plain size="small" @click="openPopupIframe">
        {{ $t('menu.unlock_now') }}
      </el-button>
    </div>
    <div v-else class="text-center">
      <p class="mb-3">
        {{ $t('menu.log_in_to_autofill') }}
      </p>
      <el-button type="primary" plain size="small" @click="openPopupIframe">
        {{ $t('menu.login_now') }}
      </el-button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
export default Vue.extend(
  {
    components: {
    },
    props: {
    },
    data(){
      return {
      }
    },
    methods: {
      async openPopupIframe() {
        await this.$runtimeBackground.handleOpenPopupIframe()
        this.closeMenu()
      }
    }
  }
)
</script>

<style lang="scss" scoped>
</style>
