<template>
  <div class="flex flex-col flex-column-fluid relative">
    <div class="flex-column-fluid lg:px-28 py-10 px-10 mb-20">
      <div>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="Start date"
          end-placeholder="End date"
          format="dd/MM/yyyy"
          value-format="yyyy-MM-dd"
          :picker-options="pickerOptions"
          @change="handleChange"
        />
      </div>
      <el-table
        :data="logs"
        style="width: 100%"
      >
        <el-table-column label="Users">
          <template slot-scope="scope">
            <div class="flex items-center">
              <el-avatar
                :src="scope.row.acting_user && scope.row.acting_user.avatar"
                :size="32"
              />
              <div class="ml-2">
                <div class="text-black font-semibold truncate">
                  {{ (scope.row.acting_user && scope.row.acting_user.name) || 'Unknown' }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Event">
          <template slot-scope="scope">
            {{ scope.row.description[language] }}
          </template>
        </el-table-column>
        <el-table-column>
          <template slot-scope="scope">
            {{ $moment(scope.row.date).utc().format('LLLZ') }}
          </template>
        </el-table-column>
      </el-table>
      <div
        v-if="continuationToken"
        class="text-center"
      >
        <button
          class="btn btn-clean btn-primary"
          :disabled="loading"
          @click="getLogs"
        >
          Load more
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data () {
    return {
      users: [],
      logs: [],
      dateRange: [],
      pickerOptions: {
        disabledDate: date => {
          return date > this.$moment()
        }
      },
      continuationToken: null,
      loading: false
    }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  mounted () {
    this.dateRange = [this.$moment().subtract(1, 'weeks').format('YYYY-MM-DD'), this.$moment().format('YYYY-MM-DD')]
    this.getLogs()
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    getLogs () {
      if (this.dateRange && this.dateRange.length === 2) {
        const from = this.$moment.utc(this.dateRange[0]).startOf('day').unix()
        const to = this.$moment.utc(this.dateRange[1]).endOf('day').unix()
        this.loading = true
        this.axios.get(`cystack_platform/pm/teams/${this.$route.params.teamId}/logs`, {
          params: {
            from,
            to,
            continuation_token: this.continuationToken
          }
        })
          .then(res => {
            this.logs = this.logs.concat(res.results)
            this.continuationToken = res.continuation_token
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    handleChange () {
      this.continuationToken = null
      this.logs = []
      this.getLogs()
    }
  }
}
</script>
