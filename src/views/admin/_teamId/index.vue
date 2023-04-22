<template>
  <div class="flex flex-col flex-column-fluid relative">
    <div class="flex-column-fluid lg:px-28 py-10 px-10 mb-20">
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-x-6">
        <div class="border border-black-200 rounded py-6 px-7">
          <div class="text-black-600">
            Số người dùng hiện tại
          </div>
          <div class="text-head-1 text-primary font-semibold">
            {{ dashboard.members.total }}
          </div>
        </div>
        <div class="border border-black-200 rounded py-6 px-7">
          <div class="text-black-600">
            Số mật khẩu chia sẻ
          </div>
          <div class="text-head-1 text-info font-semibold">
            {{ dashboard.login.total }}
          </div>
        </div>
        <div class="border border-black-200 rounded py-6 px-7">
          <div class="text-black-600">
            Số mật khẩu tổng yếu
          </div>
          <div class="text-head-1 text-danger font-semibold">
            {{ dashboard.master_password.weak }}
          </div>
        </div>
        <div class="border border-black-200 rounded py-6 px-7">
          <div class="text-black-600">
            Tỉ lệ mật khẩu an toàn
          </div>
          <div
            class="text-head-1 font-semibold"
            :class="{'text-success': strongRate >= 75,
                     'text-warning': strongRate >= 50,
                     'text-danger': strongRate < 50
            }"
          >
            {{ strongRate | formatPercentage }}%
          </div>
        </div>
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
      dashboard: {
        items: {
          total: 0, trash: 0, login: 0, secure_note: 0, card: 0, identity: 0
        },
        members: {
          total: 0,
          roles: { owner: 0, admin: 0, manager: 0, member: 0 },
          status: { confirmed: 0, accepted: 0, invited: 0 }
        },
        login: {
          total: 0,
          scores: [
            { score: 0, count: 0 },
            { score: 0, count: 0 },
            { score: 0, count: 0 }
          ],
          avg_score: 0
        },
        master_password: {
          weak: 0
        }
      }
    }
  },
  computed: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    strongRate () {
      if (this.dashboard.login && this.dashboard.login.scores) {
        const strongScores = this.dashboard.login.scores.filter(e => e.score > 0)
        const count = strongScores.reduce((total, value) => total + value.count, 0)
        return count / this.dashboard.login.total * 100
      }
      return 0
    }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  mounted () {
    this.getDashboard()
  },
  methods: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getDashboard () {
      try {
        this.dashboard = await this.axios.get(`cystack_platform/pm/teams/${this.$route.params.teamId}/dashboard`)
      // eslint-disable-next-line no-empty
      } catch (e) {}
    }
  }
}
</script>
