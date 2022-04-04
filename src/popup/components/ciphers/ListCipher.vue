<template>
  <div
    v-loading="loading"
    class="relative mx-auto"
    style="padding-top: 44px; min-height: 600px; max-width: 400px"
  >

    <div
      class="fixed top-0 flex justify-between items-center bg-black-300 cursor-pointer h-[44px] leading-[44px] px-5"
      style="z-index:1; width: 400px"
    >
      <div
        class="menu-icon mr-4"
        @click="$router.back()"
      >
        <i class="fas fa-chevron-left text-[20px]"></i> {{$t('common.back')}}
      </div>
      <div @click="$router.push({name: 'add-item-create', params: {type: type}})">
        <i class="fas fa-plus-circle hover:text-primary text-black-500 text-[20px]"></i>
      </div>
    </div>

    <NoCipher
      v-if="shouldRenderNoCipher"
      :type="type"
      @add-cipher="handleAddButton"
    />
    <div>
      <ul class="">
        <li
          v-for="item in dataRendered"
          :key="item.id"
          class="flex items-center hover:bg-[#E4F2E1] cursor-pointer h-[62px] px-5 border-t border-black-400"
          @click.self="fillCipher(item)"
        >
          <div
            class="text-[34px] mr-3 flex-shrink-0"
            :class="{'filter grayscale': item.isDeleted}"
            @click="fillCipher(item)"
          >
            <Vnodes :vnodes="getIconCipher(item, 34)" />
          </div>
          <div
            class="flex-grow"
            @click="fillCipher(item)"
          >
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
              <el-dropdown
                v-if="!item.isDeleted"
                trigger="click"
                :hide-on-click="false"
              >
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
              <button
                class="btn btn-icon btn-xs hover:text-primary"
                @click="addEdit(item)"
              >
                <i class="fas fa-pen" />
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import orderBy from "lodash/orderBy";
import { CipherType } from "jslib-common/enums/cipherType";
import Vnodes from "@/components/Vnodes";
import NoCipher from "@/components/cipher/NoCipher";
import { BrowserApi } from "@/browser/browserApi";
const BroadcasterSubscriptionId = 'ChildViewComponent';
import { CipherView } from "jslib-common/models/view/cipherView";
import { CipherRepromptType } from "jslib-common/enums/cipherRepromptType";
export default Vue.extend({
  components: {
    Vnodes,
    NoCipher
  },
  props: {
    deleted: {
      type: Boolean,
      default: false
    },
    routeName: {
      type: String,
      default: 'passwords'
    },
    filter: {
      type: Function,
      default: c => c.type === CipherType['Login']
    }
  },
  data () {
    return {
      CipherType,
      loading: true,
      dataRendered: [],
      renderIndex: 0,
      pageDetails: []
    }
  },
  async mounted () {
    await this.loadPageDetails()
    window.onscroll = () => {
      const bottomOfWindow = Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop) + window.innerHeight + 500 >= document.documentElement.scrollHeight

      if (bottomOfWindow) {
        this.renderIndex += 50
        if (this.renderIndex <= this.ciphers.length) {
          this.dataRendered = this.dataRendered.concat(this.ciphers.slice(this.renderIndex, this.renderIndex + 50))
        }
      }
    }
    chrome.runtime.onMessage.addListener(
      (msg: any, sender: chrome.runtime.MessageSender, response: any) => {
        switch (msg.command) {
        case "collectPageDetailsResponse":
          if (msg.sender === BroadcasterSubscriptionId) {
            const pageDetailsObj = {
              frameId: sender.frameId,
              tab: msg.tab,
              details: msg.details,
            };
            this.pageDetails.push(pageDetailsObj);
          }
          break;
        default:
          break;
        }
      }
    )
  },
  watch: {
    ciphers () {
      if (this.ciphers) {
        this.loading = false
      }
    }
  },
  computed: {
    // type() {
    //   if(this.ciphers.length){
    //     const type = this.ciphers[0].type
    //     switch(type){
    //     case CipherType.Login:
    //       return 'Login'
    //     case CipherType.SecureNote:
    //       return 'SecureNote'
    //     case CipherType.Card:
    //       return 'Card';
    //     case CipherType.Identity:
    //       return 'Identity' 
    //     default:
    //       return 'Login'
    //     }
    //   }
    //   return 'Login'
    // },
    type () {
      switch (this.routeName) {
      case 'passwords':
        return 'Login'
      case 'notes':
        return 'SecureNote'
      case 'cards':
        return 'Card'
      case 'identities':
        return 'Identity'
      case 'vault':
        return 'Vault'
      case 'shares':
        return 'Shares'
      case 'trash':
        return 'Trash'
      default:
        return null
      }
    },
    shouldRenderNoCipher () {
      const filteredCiphers = this.ciphers || []
      return !filteredCiphers.length
    }
  },
  asyncComputed: {
    ciphers: {
      async get () {
        const deletedFilter = c => {
          return c.isDeleted === this.deleted
        }
        let result = await this.$searchService.searchCiphers(this.searchText, [this.filter, deletedFilter], null) || []
        // remove ciphers generated by authenticator
        result = result.filter(cipher => [CipherType.Login, CipherType.SecureNote, CipherType.Card, CipherType.Identity].includes(cipher.type))
        this.dataRendered = result.slice(0, 50)
        this.renderIndex = 0
        return orderBy(result, [c => this.orderField === 'name' ? (c.name && c.name.toLowerCase()) : c.revisionDate], [this.orderDirection]) || []
      },
      watch: ['$store.state.syncedCiphersToggle', 'deleted', 'searchText', 'filter', 'orderField', 'orderDirection']
    },
    folders: {
      async get () {
        let folders = await this.$folderService.getAllDecrypted() || []
        folders = folders.filter(f => f.id)
        folders.forEach(f => {
          const ciphers = this.ciphers && (this.ciphers.filter(c => c.folderId === f.id) || [])
          f.ciphersCount = ciphers && ciphers.length
        })
        return folders
      },
      watch: ['searchText', 'orderField', 'orderDirection', 'ciphers']
    },
    // collections: {
    //   async get () {
    //     let collections = await this.$collectionService.getAllDecrypted() || []
    //     collections = collections.filter(f => f.id)
    //     collections.forEach(f => {
    //       const ciphers = this.ciphers && (this.ciphers.filter(c => c.collectionIds.includes(f.id)) || [])
    //       f.ciphersCount = ciphers && ciphers.length
    //     })
    //     return collections
    //   },
    //   watch: ['searchText', 'orderField', 'orderDirection', 'ciphers']
    // }
  },
  methods: {
    // addEdit (item) {
    //   this.$platformUtilsService.launchUri(`/web.html#/vault/${item.id}`)
    // },
    addEdit (item) {
      // this.$platformUtilsService.launchUri(`/web.html#/vault/${item.id}`)
      this.$router.push({ name: 'add-item-create', params: { data: item } })
    },
    handleAddButton () {
      this.$router.push({ name: 'add-item-create', params: { type: this.type } })
    },
    async loadPageDetails() {
      this.pageDetails = [];
      this.tab = await BrowserApi.getTabFromCurrentWindow();
      if (this.tab == null) {
        return;
      }
      BrowserApi.tabSendMessage(this.tab, {
        command: 'collectPageDetails',
        tab: this.tab,
        sender: BroadcasterSubscriptionId,
      });
    },
    async fillCipher(cipher: CipherView) {
      // console.log(this.pageDetails.length);
      if (
        cipher.reprompt !== CipherRepromptType.None &&
        !(await this.$passwordRepromptService.showPasswordPrompt())
      ) {
        return;
      }

      this.totpCode = null;
      if (this.totpTimeout != null) {
        window.clearTimeout(this.totpTimeout);
      }

      if (this.pageDetails == null || this.pageDetails.length === 0) {
        // this.toasterService.popAsync('error', null, this.$i18nService.t('autofillError'));
        this.notify(
          this.$t('errors.autofill'),
          "error"
        );
        return;
      }

      try {
        this.totpCode = await this.$autofillService.doAutoFill({
          cipher: cipher,
          pageDetails: this.pageDetails,
          doc: window.document,
          fillNewPassword: true,
        });
        if (this.totpCode != null) {
          this.$platformUtilsService.copyToClipboard(this.totpCode, {
            window: window,
          });
        }
        if (this.$popupUtilsService.inPopup(window)) {
          if (
            this.$platformUtilsService.isFirefox() ||
            this.$platformUtilsService.isSafari()
          ) {
            BrowserApi.closePopup(window);
          } else {
            // Slight delay to fix bug in Chromium browsers where popup closes without copying totp to clipboard
            setTimeout(() => BrowserApi.closePopup(window), 50);
          }
        }
      } catch (e) {
        this.notify(
          this.$t('errors.autofill'),
          "error"
        );
        // this.notify(e, 'warning')
      }
    },
  }
})
</script>
