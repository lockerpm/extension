<template>
  <div class="flex flex-col flex-column-fluid relative bg-[#FBFBFC]">
    <div class="flex-column-fluid lg:px-28 py-10 px-10 mb-20">
      <div class="text-head-5 font-semibold mb-4">Team Policies</div>
      <div class="setting-wrapper">
        <div class="setting-section">
          <div class="setting-section-header">
            <div class="md:w-[400px]">
              <div class="form-group">
                <label for="">Minimum password length</label>
                <!-- <input v-model="teamPolicy.min_password_length" type="number" min="0" max="128" class="form-control"> -->
                <div>
                  <input
                    v-model="teamPolicy.min_password_length"
                    class="h-[44px] w-[70px] mt-4 mr-3"
                    type="number"
                    min="0"
                    max="128"
                    @change="updateLength('min_password_length')"
                  >
                  <el-slider
                    v-model="teamPolicy.min_password_length"
                    :min="0"
                    :max="128"
                    :debounce="800"
                  />
                </div>
              </div>
              <div class="form-group">
                <label for="">Maximum password length</label>
                <!-- <input v-model="teamPolicy.max_password_length" type="number" min="0" max="128" class="form-control"> -->
                <div>
                  <input
                    v-model="teamPolicy.max_password_length"
                    class="h-[44px] w-[70px] mt-4 mr-3"
                    type="number"
                    min="0"
                    max="128"
                    @change="updateLength('max_password_length')"
                  >
                  <el-slider
                    v-model="teamPolicy.max_password_length"
                    :min="0"
                    :max="128"
                    :debounce="800"
                  />
                </div>
              </div>
              <div class="form-group">
                <div class="flex">
                  <label for="" class="mr-2">Password Composition</label>
                  <!-- <el-switch v-model="teamPolicy.password_composition" /> -->
                  <el-checkbox v-model="teamPolicy.password_composition" />
                </div>
              </div>
              <div class="form-group">
                <label for="">Failed login attempts</label>
                <input v-model="teamPolicy.failed_login_attempts" type="number" min="0" max="128" class="form-control">
              </div>
              <div class="form-group">
                <label for="">Failed login duration</label>
                <el-select
                  v-model="teamPolicy.failed_login_duration"
                  placeholder=""
                  :disabled="loading"
                >
                  <el-option
                    v-for="item in loginDurations"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
              <div class="form-group">
                <label for="">Failed login block time</label>
                <el-select
                  v-model="teamPolicy.failed_login_block_time"
                  placeholder=""
                  :disabled="loading"
                >
                  <el-option
                    v-for="item in loginDurations"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
              <div class="form-group">
                <button
                  class="btn btn-primary"
                  :disabled="loading"
                  @click="putTeamPolicy"
                >
                  {{ $t('common.update') }}
                </button>
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
  components: {
  },
  data () {
    return {
      loading: false,
      teamPolicy: {}
    }
  },
  computed: {
    loginDurations () {
      return [
        { label: this.$t('data.timeouts.oneMinute'), value: 60 },
        { label: this.$t('data.timeouts.fiveMinutes'), value: 300 },
        { label: this.$t('data.timeouts.tenMinutes'), value: 600 },
        { label: this.$t('data.timeouts.fifteenMinutes'), value: 900 },
        { label: this.$t('data.timeouts.thirtyMinutes'), value: 1800 },
        { label: this.$t('data.timeouts.oneHour'), value: 3600 },
        { label: this.$t('data.timeouts.fourHours'), value: 14400 }
      ]
    }
  },
  mounted () {
    this.getTeamPolicy()
  },
  methods: {
    async getTeamPolicy () {
      this.teamPolicy = await this.axios.get(`cystack_platform/pm/teams/${this.$route.params.teamId}/policy`)
    },
    async putTeamPolicy () {
      try {
        this.loading = true
        const newPolicy = {
          ...this.teamPolicy,
          min_password_length: parseInt(this.teamPolicy.min_password_length) > 0 ? parseInt(this.teamPolicy.min_password_length) : null,
          max_password_length: parseInt(this.teamPolicy.max_password_length) > 0 ? parseInt(this.teamPolicy.max_password_length) : null,
          failed_login_attempts: parseInt(this.teamPolicy.failed_login_attempts) > 0 ? parseInt(this.teamPolicy.failed_login_attempts) : null
        }
        this.team = await this.axios.put(`cystack_platform/pm/teams/${this.$route.params.teamId}/policy`, newPolicy)
        this.notify(this.$t('data.notifications.update_team_success'), 'success')
      } catch (e) {
        this.notify(this.$t('data.notifications.update_team_failed'), 'warning')
      } finally {
        this.loading = false
      }
    },
    updateLength (v) {
      this.teamPolicy[`${v}`] = parseInt(this.teamPolicy[`${v}`])
    }
  }
})
</script>
