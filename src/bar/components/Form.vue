<template>
  <div
    class="bar-form"
  >
    <el-form
      ref="form"
      label-width="120px"
      :model="data"
      :rules="rules"
    >
      <el-form-item :label="$t('common.username')">
        <el-input
          v-model="data.username"
          size="small"
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('common.password')">
        <el-input
          v-model="data.password"
          size="small"
          :type="showPassword ? 'text' : 'password'"
        >
          <i
            class="el-icon-view"
            slot="suffix"
            @click="() => showPassword = !showPassword">
          </i>
        </el-input>
      </el-form-item>
      <el-form-item v-if="!data.id" :label="$t('common.folder')">
        <el-select
          v-model="data.folderId"
          size="small"
          class="w-full"
          :placeholder="$t('data.folders.select_folder')"
        >
          <el-option
            v-for="folder in (folders || [])"
            :key="folder.id"
            :label="folder.name"
            :value="folder.id">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  name: 'BarForm',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      showPassword: false
    }
  },
  asyncComputed: {
    folders: {
      async get() {
        return await this.$folderService.getAllDecrypted()
      },
      watch: []
    }
  },
  computed: {
    rules() {
      return {
        username: [
          { required: true, message: this.$t('data.login.message.required', { name: this.$t('common.username') })},
        ],
        password: [
          { required: true, message: this.$t('data.login.message.required', { name: this.$t('common.password') })},
        ]
      }
    }
  },
  methods: {
  }
})
</script>

<style lang="scss">
</style>
