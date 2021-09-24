<template>
  <div>
    <p>{{ defaultText }}</p>
    <p>token: {{ token }}</p>
    <p>tokenStorage: {{ tokenStorage }}</p>
    <p>test: {{ test }}</p>
    <button class="btn" @click="$router.push({name: 'About'})">About</button>
    <button class="btn" @click="getToken">GetToken</button>
    <button class="btn" @click="setToken">SetToken</button>
    <button class="btn" @click="testBtn">Gett test</button>
    {{ token }}
    <table class="outter-table">
      <tbody>
      <tr>
        <td>haha</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'HelloWorld',
  mounted () {
    browser.runtime.sendMessage({})
  },
  data () {
    return {
      token: ''
    }
  },
  computed: {
    defaultText () {
      return browser.i18n.getMessage('extName')
    },
    tokenStorage () {
      return this.$store.state.token
    },
    test () {
      return this.$store.state.token
    }
  },
  methods: {
   async getToken () {
     this.token = await this.$storageService.get('cs-token')
    },
    async setToken () {
      this.$store.commit('UPDATE_TEST', new Date())
    },
    testBtn () {
     console.log(this.$store.state)
    }
  }
})
</script>

<style scoped>
p {
  font-size: 20px;
}
</style>
