<template>
  <div class="flex flex-col flex-column-fluid relative bg-[#FBFBFC]">
    <div class="flex-column-fluid lg:px-28 py-10 px-10 mb-20">
      <div class="mb-5">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item
            :to="{name: 'tools'}"
          >
            Tools
          </el-breadcrumb-item>
          <el-breadcrumb-item
            :to="{name: 'tools-password-health'}"
          >
            Password Health
          </el-breadcrumb-item>
          <el-breadcrumb-item
            v-if="$route.path === '/tools/password-health/weak'"
            :to="{name: 'tools-password-health-weak'}"
          >
            Weak Passwords
          </el-breadcrumb-item>
          <el-breadcrumb-item
            v-if="$route.path === '/tools/password-health/reused'"
            :to="{name: 'tools-password-health-reused'}"
          >
            Reused Passwords
          </el-breadcrumb-item>
          <el-breadcrumb-item
            v-if="$route.path === '/tools/password-health/exposed'"
            :to="{name: 'tools-password-health-exposed'}"
          >
            Exposed Passwords
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div v-if="$route.path === '/tools/password-health'" class="setting-wrapper">
        <div
          class="setting-section setting-section--hover"
          @click="go({name: 'tools-password-health-weak'})"
        >
          <div class="setting-section-header">
            <div class="flex items-center">
              <div
                class="w-[48px] h-[48px] flex items-center justify-center rounded-full text-head-5 text-white mr-3"
                :class="{
                  'bg-danger': weakPasswordCiphers && weakPasswordCiphers.length > 1,
                  'bg-success': weakPasswordCiphers && weakPasswordCiphers.length === 0
                }"
              >
                <span v-if="weakPasswordCiphers && weakPasswordCiphers.length">
                  <span v-if="weakPasswordCiphers.length > 99">99+</span>
                  <span v-else>{{ weakPasswordCiphers.length }}</span>
                </span>
                <span v-else>0</span>
              </div>
              <div>
                <button
                  class="setting-title cursor-pointer"
                  @click="go({name: 'tools-password-health-weak'})"
                >
                  Weak Passwords
                </button>
                <div class="setting-description">
                  Easy to guess
                </div>
              </div>
            </div>
            <div>
              <button
                class="btn btn-icon !text-black-600"
                @click="go({name: 'tools-password-health-weak'})"
              >
                <i class="fa fa-chevron-right" />
              </button>
            </div>
          </div>
        </div>
        <div
          class="setting-section setting-section--hover"
          @click="go({name: 'tools-password-health-reused'})"
        >
          <div class="setting-section-header">
            <div class="flex items-center">
              <div
                class="w-[48px] h-[48px] flex items-center justify-center rounded-full text-head-5 text-white mr-3"
                :class="{
                  'bg-danger': reusedPasswordCiphers && reusedPasswordCiphers.length > 1,
                  'bg-success': reusedPasswordCiphers && reusedPasswordCiphers.length === 0
                }"
              >
                <span v-if="reusedPasswordCiphers && reusedPasswordCiphers.length">
                  <span v-if="reusedPasswordCiphers.length > 99">99+</span>
                  <span v-else>{{ reusedPasswordCiphers.length }}</span>
                </span>
                <span v-else>0</span>
              </div>
              <div>
                <button
                  class="setting-title cursor-pointer"
                  @click="go({name: 'tools-password-health-reused'})"
                >
                  Reused Passwords
                </button>
                <div class="setting-description">
                  Used for multiple accounts
                </div>
              </div>
            </div>
            <div>
              <button
                class="btn btn-icon !text-black-600"
                @click="go({name: 'tools-password-health-reused'})"
              >
                <i class="fa fa-chevron-right" />
              </button>
            </div>
          </div>
        </div>
        <div
          class="setting-section setting-section--hover"
          @click="go({name: 'tools-password-health-exposed'})"
        >
          <div class="setting-section-header">
            <div class="flex items-center">
              <img src="@/assets/images/icons/icon_tools_pw_breach.svg" alt="" class="mr-3">
              <div>
                <button
                  class="setting-title cursor-pointer"
                  @click="go({name: 'tools-password-health-exposed'})"
                >
                  Exposed Passwords
                </button>
                <div class="setting-description">
                  Exposed passwords are passwords that have been uncovered in known data breaches that were released publicly or sold on the dark web by hackers.
                </div>
              </div>
            </div>
            <div>
              <button
                class="btn btn-icon !text-black-600"
                @click="go({name: 'tools-password-health-exposed'})"
              >
                <i class="fa fa-chevron-right" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <router-view
        :weak-password-ciphers="weakPasswordCiphers"
        :reused-password-ciphers="reusedPasswordCiphers"
        :password-strength-map="passwordStrengthMap"
        :password-use-map="passwordUseMap"
      />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import {CipherType} from "jslib-common/enums/cipherType";
export default Vue.extend({
  components: { },
  data () {
    return {
      passwordStrengthCache: new Map(),
      passwordStrengthMap: new Map(),
      passwordUseMap: new Map(),
      weakPasswordCiphers: []
    }
  },
  watch: {
    currentPlan (newValue) {
      if (newValue.alias === 'pm_free') {
        this.$router.push('/vault')
      }
    }
  },
  mounted () {
    if (this.currentPlan.alias === 'pm_free') {
      this.$router.push('/vault')
    }
  },
  asyncComputed: {
    weakPasswordCiphers: {
      async get () {
        const allCiphers = await this.$cipherService.getAllDecrypted()
        const weakPasswordCiphers = []
        const isUserNameNotEmpty = c => {
          return c.login.username != null && c.login.username.trim() !== ''
        }
        const getCacheKey = c => {
          return c.login.password + '_____' + (isUserNameNotEmpty(c) ? c.login.username : '')
        }

        allCiphers.forEach(c => {
          if (c.type !== CipherType.Login || c.login.password == null || c.login.password === '' || c.isDeleted) {
            return
          }
          const hasUserName = isUserNameNotEmpty(c)
          const cacheKey = getCacheKey(c)
          if (!this.passwordStrengthCache.has(cacheKey)) {
            let userInput = []
            if (hasUserName) {
              const atPosition = c.login.username.indexOf('@')
              if (atPosition > -1) {
                userInput = userInput.concat(
                  c.login.username.substr(0, atPosition).trim().toLowerCase().split(/[^A-Za-z0-9]/))
                  .filter(i => i.length >= 3)
              } else {
                userInput = c.login.username.trim().toLowerCase().split(/[^A-Za-z0-9]/)
                  .filter(i => i.length >= 3)
              }
            }
            const result = this.$passwordGenerationService.passwordStrength(c.login.password,
              userInput.length > 0 ? userInput : null)
            this.passwordStrengthCache.set(cacheKey, result.score)
          }
          const score = this.passwordStrengthCache.get(cacheKey)
          if (score != null && score <= 2) {
            this.passwordStrengthMap.set(c.id, score)
            weakPasswordCiphers.push(c)
          }
        })
        weakPasswordCiphers.sort((a, b) => {
          return this.passwordStrengthCache.get(getCacheKey(a)) -
            this.passwordStrengthCache.get(getCacheKey(b))
        })

        return weakPasswordCiphers
      },
      watch: ['$store.state.syncedCiphersToggle']
    },
    reusedPasswordCiphers: {
      async get () {
        const allCiphers = await this.$cipherService.getAllDecrypted()
        const ciphersWithPasswords = []
        this.passwordUseMap = new Map()
        allCiphers.forEach(c => {
          if (c.type !== CipherType.Login || c.login.password == null || c.login.password === '' || c.isDeleted) {
            return
          }
          ciphersWithPasswords.push(c)
          if (this.passwordUseMap.has(c.login.password)) {
            this.passwordUseMap.set(c.login.password, this.passwordUseMap.get(c.login.password) + 1)
          } else {
            this.passwordUseMap.set(c.login.password, 1)
          }
        })
        const reusedPasswordCiphers = ciphersWithPasswords.filter(c =>
          this.passwordUseMap.has(c.login.password) && this.passwordUseMap.get(c.login.password) > 1)

        return reusedPasswordCiphers
      },
      watch: ['$store.state.syncedCiphersToggle', 'passwordUseMap']
    }
  },
  methods: {
    go (route) {
      this.$router.push(route)
    }
  }
})
</script>
