<template>
  <div>
    <div class="text-head-5 font-semibold mb-4">Team Information</div>
    <div class="setting-wrapper">
      <div class="setting-section">
        <div class="setting-section-header">
          <div class="md:w-[400px]">
            <div class="form-group">
              <label for="">ID</label>
              <input :value="currentOrg.id" type="text" class="form-control" disabled>
            </div>
            <div class="form-group">
              <label for="">Name</label>
              <input v-model="team.name" type="text" class="form-control">
            </div>
            <div class="form-group">
              <label for="">Description</label>
              <el-input v-model="team.description" type="textarea" :rows="5" />
            </div>
            <div class="form-group">
              <button
                class="btn btn-primary"
                :disabled="loading || !team.name"
                @click="putTeam"
              >
                {{ $t('common.update') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="text-head-5 font-semibold mb-4 text-danger">Danger Zone</div>
    <div class="setting-wrapper">
      <div class="setting-section">
        <div class="setting-section-header">
          <div>
            <div class="setting-description mb-4">
              Careful, these actions are not reversible!
            </div>
            <div>
              <button
                class="btn btn-default !text-danger"
                @click="openPurgeTeamVault()"
              >
                Delete all Team's items
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <PurgeTeamVault ref="purgeTeamVault" />
  </div>
</template>

<script>
import PurgeTeamVault from '../../../../components/setting/PurgeTeamVault'
export default {
  components: {
    PurgeTeamVault
  },
  data () {
    return {
      loading: false,
      team: {}
    }
  },
  computed: {
  },
  mounted () {
    this.getTeam()
  },
  methods: {
    async getTeam () {
      this.team = await this.axios.get(`cystack_platform/pm/teams/${this.$route.params.teamId}`)
    },
    async putTeam () {
      try {
        this.loading = true
        this.team = await this.axios.put(`cystack_platform/pm/teams/${this.$route.params.teamId}`, this.team)
        this.notify(this.$t('data.notifications.update_team_success'), 'success')
      } catch (e) {
        this.notify(this.$t('data.notifications.update_team_failed'), 'warning')
      } finally {
        this.loading = false
      }
    },
    openPurgeTeamVault () {
      this.$refs.purgeTeamVault.openDialog()
    }
  }
}
</script>
