<template>
  <div>
    <li
        v-if="item.id"
        class="flex items-center hover:bg-[#E4F2E1] bg-white cursor-pointer h-[62px] px-5 border-b border-black-400"
        @click.self="routerCipher(item)"
      >
        <div
            class="text-[34px] mr-3 flex-shrink-0"
            :class="{'filter grayscale': item.isDeleted}"
            @click="routerCipher(item)"
          >
            <Vnodes :vnodes="getIconCipher(item, 34)" />
          </div>
        <div class="flex-grow" @click="routerCipher(item)">
          <div class="text-black font-semibold truncate flex items-center">
            {{ item.name }}
          </div>
          <div>
            {{ item.subTitle }}
          </div>
        </div>
        <div>
          <div class="col-actions">
            <button
              v-if="item.login.canLaunch"
              class="btn btn-icon btn-xs hover:text-primary"
              :title="`Launch ${item.login.uri}`"
              @click="openNewTab(item.login.uri)"
              >
                <i class="fas fa-external-link-square-alt" />
            </button>
            <el-dropdown v-if="!item.isDeleted" trigger="click" :hide-on-click="false">
              <button class="btn btn-icon btn-xs hover:text-primary">
                <i class="fas fa-clone" />
              </button>
              <el-dropdown-menu slot="dropdown">
                <template v-if="item.type === CipherType.Login">
                  <el-dropdown-item
                    v-clipboard:copy="item.login.username"
                    v-clipboard:success="clipboardSuccessHandler"
                  >
                    {{ $t('common.copy') }} {{ $t('common.username') }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-clipboard:copy="item.login.password"
                    v-clipboard:success="clipboardSuccessHandler"
                  >
                    {{ $t('common.copy') }} {{ $t('common.password') }}
                  </el-dropdown-item>
                </template>
                <template v-if="item.type === CipherType.SecureNote">
                  <el-dropdown-item
                    v-clipboard:copy="item.notes"
                    v-clipboard:success="clipboardSuccessHandler"
                    divided
                  >
                    {{ $t('common.copy') }} {{ $t('common.note') }}
                  </el-dropdown-item>
                </template>
              </el-dropdown-menu>
            </el-dropdown>
            <button class="btn btn-icon btn-xs hover:text-primary"
                    @click="addEdit(item)"
            >
              <i class="fas fa-pen" />
            </button>
          </div>
        </div>
      </li>
  </div>
</template>

<script>
import Vue from 'vue'
import {CipherType} from "jslib-common/enums/cipherType";
import { CipherView } from 'jslib-common/models/view/cipherView';
import Vnodes from "@/components/Vnodes";
export default Vue.extend(
  {
    components: {
      Vnodes
    },
    props: {
      item:{
        type: CipherView,
        default: null
      }
    },
    data(){
      return {
        CipherType
      }
    },
    methods: {
      // addEdit (item) {
      //   this.$platformUtilsService.launchUri(`/web.html#/vault/${item.id}`)
      // }
      addEdit (item) {
      // this.$platformUtilsService.launchUri(`/web.html#/vault/${item.id}`)
        this.$router.push({name: 'add-item-create', params: {data: item}})
      },
    }
  }
)
</script>

<style lang="scss" scoped>

</style>
