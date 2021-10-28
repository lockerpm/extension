<template>
  <div>
    <div
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
        <span v-if="haveData">REUSED PASSWORDS FOUND</span>
      </div>
      <div>
        <span v-if="noData">No passwords that are being reused in your vault.</span>
        <span v-if="haveData">We found {{ haveData }} passwords that are being reused in your vault. You should change them to a unique value.</span>
      </div>
    </div>
    <el-table
    ref="multipleTable"
    :data="reusedPasswordCiphers || []"
    style="width: 100%"
    row-class-name="hover-table-row"
    :show-header="false"
  >
    <el-table-column
      prop="name"
      label=""
    >
      <template slot-scope="scope">
        <div class="flex items-center">
          <div
            class="text-[34px] mr-3 flex-shrink-0"
            :class="{'filter grayscale': scope.row.isDeleted}"
          >
            <Vnodes :vnodes="getIconCipher(scope.row, 34)" />
          </div>
          <div class="flex flex-col">
            <a
              class="text-black font-semibold truncate flex items-center"
              :class="{'opacity-80': scope.row.isDeleted}"
              @click="routerCipher(scope.row)"
            >
              {{ scope.row.name }}
              <img v-if="scope.row.organizationId" src="@/assets/images/icons/shares.svg" alt="" class="inline-block ml-2">
            </a>
            <div>
              {{ scope.row.subTitle }}
            </div>
          </div>
        </div>
      </template>
    </el-table-column>
    <el-table-column
      label=""
    >
      <template slot-scope="scope">
            <span class="label label-warning-light">
              Used {{ passwordUseMap.get(scope.row.login.password) }} times
            </span>
      </template>
    </el-table-column>
  </el-table>
  </div>
</template>

<script>
import Vue from 'vue'
import Vnodes from '@/components/Vnodes'
export default Vue.extend({
  components: {
    Vnodes
  },
  props: {
    passwordUseMap: {
      type: Map,
      default () {
        return new Map()
      }
    },
    reusedPasswordCiphers: {
      type: Array,
      default () {
        return []
      }
    }
  },
  computed: {
    haveData () {
      return this.reusedPasswordCiphers && this.reusedPasswordCiphers.length
    },
    noData () {
      return this.reusedPasswordCiphers && this.reusedPasswordCiphers.length === 0
    }
  }
})
</script>
