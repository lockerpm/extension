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
            :to="{name: 'tools-breach'}"
          >
            Data Breach Scanner
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="setting-wrapper">
        <div class="setting-section">
          <div class="setting-section-header">
            <div>
              <div class="setting-description">
                A "breach" is an incident where a site's data has been illegally accessed by hackers and then released publicly. Review the types of data that were compromised (email addresses, passwords, credit cards etc.) and take appropriate action, such as changing passwords.
              </div>
            </div>
            <div />
          </div>
          <div class="setting-section-body">
            <div class="form-group">
              <label>
                Check any usernames or email addresses that you use.
              </label>
              <input
                v-model="email"
                type="text"
                class="form-control max-w-[500px]"
                :disabled="loading"
              >
            </div>
            <div class="form-group">
              <button
                class="btn btn-primary"
                :disabled="loading || !email"
                @click="checkBreaches"
              >
                Check Breaches
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-loading="loading" class="min-h-[500px] relative">
        <div
          v-if="!loading && checked"
          class="locker-callout mb-8"
          :class="{
            'locker-callout-success': noData,
            'locker-callout-danger': haveData
          }"
        >
          <div
            class="mb-2 font-semibold"
            :class="{
              'text-success': noData,
              'text-danger': haveData
            }"
          >
            <span v-if="noData">GOOD NEWS</span>
            <span v-if="haveData">BREACHED ACCOUNTS FOUND</span>
          </div>
          <div>
            <span v-if="noData">
              {{ email }} was not found in any known data breaches.
            </span>
            <span v-if="haveData">
              {{ email }} was found in {{ breach.length }} different data breaches online.
            </span>
          </div>
        </div>
        <div v-if="breach.length" class="setting-wrapper">
          <div
            v-for="(item, index) in breach"
            :key="index"
            class="setting-section"
          >
            <div class="setting-section-header">
              <div class="grid grid-cols-12 gap-x-4">
                <div class="col-span-2">
                  <img :src="item.logo_path" alt="" class="mr-3">
                </div>
                <div class="col-span-7">
                  <div class="setting-title mb-2">
                    {{ item.name }}
                  </div>
                  <div class="setting-description mb-2" v-html="item.description" />
                  <div class="setting-description">
                    Compromised data:
                    <ul class="list-disc list-inside">
                      <li v-for="(data, iData) in item.data_classes" :key="iData">{{ data }}</li>
                    </ul>
                  </div>
                </div>
                <div class="col-span-3">
                  <div class="font-semibold">
                    Website
                  </div>
                  <div class="text-black-600">
                    {{ item.domain }}
                  </div>
                  <div class="font-semibold">
                    Affected Users
                  </div>
                  <div class="text-black-600">
                    {{ item.pwn_count | formatNumber }}
                  </div>
                  <div class="font-semibold">
                    Breach Occurred
                  </div>
                  <div class="text-black-600">
                    {{ $moment(item.breach_date).format('LL') }}
                  </div>
                  <div class="font-semibold">
                    Breach Reported
                  </div>
                  <div class="text-black-600">
                    {{ $moment(item.added_date).format('LL') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
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
      breach: [],
      loading: false,
      checked: false,
      email: ''
    }
  },
  computed: {
    haveData () {
      return !this.loading && this.breach.length
    },
    noData () {
      return !this.loading && this.breach.length === 0
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
  methods: {
    async checkBreaches () {
      this.loading = true
      this.checked = false
      try {
        this.breach = await this.axios.post('cystack_platform/pm/tools/breach', {
          email: this.email
        })
      } finally {
        this.loading = false
        this.checked = true
      }
    }
  }
})
</script>
