<template>
  <div class="w-full px-6 text-center mt-4">
    <div>
      <div>
        <div class="text-center mt-2">
        </div>
        <div
          class="mx-auto border border-black-500 h-[1px]"
          style="width: 30px"
        >
        </div>
        <div class="mt-3 text-center">
          <p class="mb-2">
            {{$t('data.login.login_with')}}
          </p>
          <button
            v-for="s in strategies"
            :key="s.key"
            type="button"
            class="m-btn--icon btn-icon-login m-btn--pill"
            @click="loginWith(s.key)"
          >
            <el-tooltip class="item" effect="light" :content="s.name" placement="bottom">
              <img
                class="social__app-icon"
                :src="require(`@/assets/images/icons/${s.key}.svg`)"
                :alt="s.key"
              >
            </el-tooltip>
          </button>
        </div>
      </div>
      <div class="flex px-2 my-4 mx-auto">
        <div class="w-full pl-0 text-center">
          <span>
            {{$t('data.login.dont_have_account')}}
            <a
              @click.prevent="openRegister"
              tag="a"
              class="text-[#0476e9] no-underline"
            >
              {{$t('data.login.sign_up')}}
            </a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  props: {},
  data () {
    return {}
  },
  methods: {
    async openRegister() {
      await this.$runtimeBackground.authAccessToken('register')
    },
    async loginWith (provider: string) {
      await this.$runtimeBackground.authAccessToken('login', provider)
    },
  }
})
</script>

<style scoped>
.m-btn--icon {
  width: 43px;
  height: 43px;
  text-align: center;
  padding-top: 5px;
}
.btn-icon-login {
  background: transparent !important;
}
.btn-icon-login:hover {
  background: rgba(9, 30, 66, 0.02) !important;
  box-shadow: 1px 1px 5px 0 rgba(0, 0, 0, 0.2) !important;
}
.m-btn--pill {
  border-radius: 60px;
}
.social__app-icon {
  display: inline-block;
  height: 20px;
  vertical-align: -0.2rem;
  width: 20px;
  border-radius: 0;
}
.m-option {
  display: flex;
  padding: 1.4em;
  border-radius: 6px;
  border: 1px solid #ebedf2;
}
.m-option .m-option__control {
  width: 2.7rem;
  padding-top: 0.1rem;
}
.m-option .m-option__label {
  width: 100%;
}
.m-option .m-option__label .m-option__body {
  display: block;
  padding-top: 0.7rem;
  font-size: 0.85rem;
}
</style>
