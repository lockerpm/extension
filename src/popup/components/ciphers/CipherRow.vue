<template>
  <div>
    <li
        v-if="item.id"
        class="flex items-center hover:bg-black-400 cursor-pointer h-[62px] px-5 "
      >
        <div class="flex-grow">
          <div class="text-black font-semibold truncate flex items-center">
            {{ item.name }}
          </div>
          <div>
            {{ item.subTitle }}
          </div>
        </div>
        <div>
          <div class="col-actions">
            <!--            <button-->
            <!--              v-if="item.login.canLaunch"-->
            <!--              class="btn btn-icon btn-xs hover:bg-black-400"-->
            <!--              @click="$platformUtilsService.launchUri(item.login.uri)"-->
            <!--            >-->
            <!--              <i class="fas fa-external-link-square-alt" />-->
            <!--            </button>-->
            <button
              v-if="item.login.canLaunch"
              class="btn btn-icon btn-xs hover:bg-black-400"
              :title="`Launch ${item.login.uri}`"
              @click="openNewTab(item.login.uri)"
              >
                <i class="fas fa-external-link-square-alt" />
            </button>
            <el-dropdown v-if="!item.isDeleted" trigger="click" :hide-on-click="false">
              <button class="btn btn-icon btn-xs hover:bg-black-400">
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
            <button class="btn btn-icon btn-xs hover:bg-black-400"
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
export default Vue.extend(
  {
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
    }
  }
)
</script>

<style lang="scss" scoped>

</style>
