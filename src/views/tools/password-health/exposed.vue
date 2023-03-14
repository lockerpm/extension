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
        <span v-if="haveData">EXPOSED PASSWORDS FOUND</span>
      </div>
      <div>
        <span v-if="noData">
          No items in your vault that have passwords that were exposed in known data breaches.
        </span>
        <span v-if="haveData">
          We found {{ haveData }} items in your vault that have passwords that were exposed in known data breaches. You should change them to use a new password.
        </span>
      </div>
    </div>
    <el-table
      ref="multipleTable"
      :data="exposedPasswordCiphers || []"
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
                <img v-if="scope.row.organizationId" src="@/assets/images/icons/shares.svg" alt="Shared" :title="$t('common.shared_with_you')" class="inline-block ml-2">
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
              Exposed {{ exposedPasswordMap.get(scope.row.id) | formatNumber }} times
            </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import Vue from 'vue'
import Vnodes from '@/components/Vnodes'
import {CipherType} from "jslib-common/enums/cipherType";
export default Vue.extend({
  components: { Vnodes },
  data () {
    return {
      exposedPasswordMap: new Map()
    }
  },
  computed: {
    haveData () {
      return this.exposedPasswordCiphers && this.exposedPasswordCiphers.length
    },
    noData () {
      return this.exposedPasswordCiphers && this.exposedPasswordCiphers.length === 0
    }
  },
  asyncComputed: {
    exposedPasswordCiphers: {
      async get () {
        const allCiphers = await this.$cipherService.getAllDecrypted()
        const exposedPasswordCiphers = []
        const promises = []
        allCiphers.forEach(c => {
          if (c.type !== CipherType.Login || c.login.password == null || c.login.password === '' || c.isDeleted) {
            return
          }
          const promise = this.$auditService.passwordLeaked(c.login.password).then(exposedCount => {
            if (exposedCount > 0) {
              exposedPasswordCiphers.push(c)
              this.exposedPasswordMap.set(c.id, exposedCount)
            }
          })
          promises.push(promise)
        })
        await Promise.all(promises)

        return exposedPasswordCiphers
      },
      watch: ['$store.state.syncedCiphersToggle', 'exposedPasswordMap']
    }
  },
  methods: {
  }
})
</script>
