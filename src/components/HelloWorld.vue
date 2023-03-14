<template>
  <div>
    <ValidationObserver ref="form" v-slot="{ validate }">
      <h2>Integrating i18n with VeeValidate: vue-i18n {{validate}}</h2>
      <ValidationProvider name="email" rules="required|email" v-slot="{ errors }">
        <input type="text" v-model="email" placeholder="type some email">
        <span>{{ errors[0] }}</span>
      </ValidationProvider>

      <ValidationProvider name="password" rules="required|min:6" v-slot="{ errors }">
        <input type="password" v-model="password" placeholder="type something">
        <span>{{ errors[0] }}</span>
      </ValidationProvider>
    </ValidationObserver>

    <button @click="switchLoc" class="btn btn-primary">Switch Locale</button>
  </div>
</template>

<script>
import {
  ValidationProvider,
  ValidationObserver
} from "vee-validate";

import Vue from 'vue'

export default Vue.extend({
  name: "Example",
  components: {
    ValidationProvider,
    ValidationObserver
  },
  data: () => ({
    email: "",
    password: ''
  }),
  methods: {
    switchLoc () {
      // switch the locale.
      this.$i18n.locale = this.$i18n.locale === 'en' ? 'vi' : 'en';

      // re-validate to re-generate messages.
      this.$refs.form.validate();
    }
  }
}
)
</script>


<style>
span {
  display: block;
  margin-top: 20px;
}

input + span {
  margin-top: 3px;
}
</style>
