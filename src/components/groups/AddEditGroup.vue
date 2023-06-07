<template>
  <el-dialog
    :visible.sync="dialogVisible"
    width="435px"
    destroy-on-close
    top="5vh"
    custom-class="locker-dialog"
    :close-on-click-modal="false"
  >
    <div slot="title">
      <div class="text-head-5 text-black-700 font-semibold truncate">
        {{ group.id ? $t('data.groups.edit_group') : $t('data.groups.add_group') }}
      </div>
    </div>
    <div class="text-left">
      <InputText
        v-model="group.name"
        :label="$t('common.group_name')"
        class="w-full"
        :error-text="errors.name && errors.name[0]"
      />
      <div class="form-group">
        <el-radio-group v-model="group.access_all" @change="() => !group.id ? group.collections = [] : null">
          <el-radio
            :label="true"
            class="!flex items-start !break-words !whitespace-normal !mb-4"
          >
            <div>{{ $t('data.groups.access_all') }}</div>
          </el-radio>
          <el-radio
            :label="false"
            class="!flex items-start !break-words !whitespace-normal !mb-4"
          >
            <div>{{ $t('data.groups.access_selected') }}</div>
          </el-radio>
        </el-radio-group>
      </div>
      <div v-if="group.access_all === false" class="form-group">
        <el-checkbox-group v-model="group.collections">
          <el-checkbox
            v-for="item in collections"
            :key="item.id"
            :label="item.id"
          >
            {{ item.name }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
    <div slot="footer" class="dialog-footer flex items-center text-left">
      <div class="flex-grow" />
      <div>
        <button
          class="btn btn-default"
          @click="dialogVisible = false"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          class="btn btn-primary"
          :disabled="loading"
          @click="group.id ? putGroup(group) : postGroup(group)"
        >
          {{ group.id ? $t('common.update') : $t('common.add') }}
        </button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import InputText from '../input/InputText'

import cystackPlatformAPI from '@/api/cystack_platform'

export default Vue.extend({
  components: {
    InputText
  },
  data () {
    return {
      loading: false,
      dialogVisible: false,
      errors: {},
      group: {
        name: '',
        access_all: false,
        collections: []
      }
    }
  },
  asyncComputed: {
    collections: {
      async get () {
        const collections = await this.$collectionService.getAllDecrypted() || []
        return collections.filter(c => !c.readOnly && c.organizationId === this.$route.params.teamId)
      },
      watch: ['$store.state.syncedCiphersToggle']
    }
  },
  methods: {
    async openDialog (group = {}) {
      if (group.id) {
        this.group = await this.getGroup(group)
      } else {
        this.group = {
          name: '',
          access_all: false,
          collections: []
        }
      }
      this.dialogVisible = true
    },
    closeDialog () {
      this.dialogVisible = false
    },
    async getGroup (group) {
      return await cystackPlatformAPI.team_group(this.$route.params.teamId, group.id)
    },
    async postGroup (group) {
      try {
        this.loading = true
        await cystackPlatformAPI.create_team_group(this.$route.params.teamId, group)
        this.notify(this.$t('data.notifications.add_group_success'), 'success')
        this.closeDialog()
        this.$emit('done')
      } catch (e) {
        this.errors = (e.response && e.response.data && e.response.data.details) || {}
        this.notify(this.$t('data.notifications.add_group_failed'), 'warning')
      } finally {
        this.loading = false
      }
    },
    async putGroup (group) {
      try {
        this.loading = true
        await cystackPlatformAPI.update_team_group(this.$route.params.teamId, group.id, group)
        this.notify(this.$t('data.notifications.update_group_success'), 'success')
        this.closeDialog()
        this.$emit('done')
      } catch (e) {
        this.errors = (e.response && e.response.data && e.response.data.details) || {}
        this.notify(this.$t('data.notifications.update_group_failed'), 'warning')
      } finally {
        this.loading = false
      }
    },
    async deleteGroup (group) {
      this.$confirm(this.$t('data.notifications.delete_group_description'), this.$t('common.warning'), {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(async () => {
        try {
          this.loading = true
          await cystackPlatformAPI.delete_team_group(this.$route.params.teamId, group.id)
          this.closeDialog()
          this.$emit('done')
          this.notify(this.$t('data.notifications.delete_group_success'), 'success')
        } catch (e) {
          this.errors = (e.response && e.response.data && e.response.data.details) || {}
          this.notify(this.$t('data.notifications.delete_group_failed'), 'warning')
        } finally {
          this.loading = false
        }
      })
    }
  }
})
</script>
