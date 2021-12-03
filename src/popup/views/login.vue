<template>
  <div class="flex flex-grow flex-col items-center">
    <div class="md:w-[410px] md:mx-0 mx-5 py-[2.8125rem] px-6 text-center">
      <form
      class="mb-8"
      @submit.prevent="submit"
    >
      <div class="form-group !mb-4">
        <label class="text-left">
          Username/Email
        </label>
        <div class="input-group mb-1.5">
          <input
            v-model="email"
            type="text"
            class="form-control"
          >
        </div>
        <div class="invalid-feedback">{{ $t('errors.invalid_username') }}</div>
      </div>
      <div class="form-group !mb-4">
        <label class="text-left">
          Password
        </label>
        <div class="input-group mb-1.5">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="form-control"
            :class="[errors ? 'is-invalid' :'']"
            :name="randomString()"
            autocomplete="new-password"
          >
          <div class="input-group-append !bg-white">
            <button
              class="btn btn-icon"
              type="button"
              tabindex="-1"
              @click="showPassword = !showPassword"
            >
              <i
                class="far"
                :class="{'fa-eye': !showPassword, 'fa-eye-slash': showPassword}"
              />
            </button>
          </div>
        </div>
        <div class="invalid-feedback">{{ $t('errors.invalid_password') }}</div>
      </div>
    </form>
    <div class="form-group">
      <div class="grid lg:grid-cols-2 grid-cols-1 gap-2">
        <button
          class="btn btn-primary w-full"
          :disabled="loading"
          @click="submit"
        >
          Login
        </button>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
export default Vue.extend({
  data () {
    return {
      email: '',
      password: '',
      loading: false,
      errors: false,
      showPassword: false,
      loadingSend: false
    }
  },
  methods: {
    async submit(){
      this.loading = true
      try{
        const res = this.axios.post('/login',{
          email: this.email,
          password: this.password
        })
        try {
          await this.storageService.save('cs_token', res.token)
          const store = await this.storageService.get('cs_store')
          let oldStoreParsed = {}
          if (typeof store === 'object') {
            oldStoreParsed = store
          }
          await this.storageService.save('cs_store', {
            ...oldStoreParsed,
            isLoggedIn: true,
          })
          console.log({
            ...oldStoreParsed,
            isLoggedIn: true,
          })
          this.$router.push({name: 'vault'})
        }
        catch (e) {
          console.log(e)
        }
      }
      catch {
        this.notify('login failed', 'warning')
      }
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
