<template>
  <div class="private-emails">
    <el-popover
      v-model="popoverDisabled"
      placement="bottom"
      width="300"
      trigger="click"
      popper-class="locker-pw-generator"
    >
      <div>
        <div v-if="aliases.length === 0" class="text-gray px-4 py-2">
          {{ $t('hide_your_email.no_alias') }}
        </div>
        <div v-else class="private-emails--list px-4 py-2" style="max-height: 124px; overflow-y: auto;">
          <div v-for="alias in aliases" :key="alias.id">
            <p
              class="cursor-pointer hover:text-primary py-1"
              @click="() => { fillUsername(alias.full_address) }"
            >
              {{ alias.full_address }}
            </p>
          </div>
        </div>
        <div class="px-4">
          <div class="w-full" style="border-top: 1px solid rgba(230, 230, 232, 1);"></div>
        </div>
        <div class="px-4 py-2">
          <p
            class="text-primary cursor-pointer font-semibold"
            @click="() => { handleAddAddress() }"
          >
            {{$t('hide_your_email.generate_new')}}
          </p>
        </div>
      </div>
      <el-button
        slot="reference"
        type="text"
        class="p-0"
        @click="() => openPopover()"
      >
        {{ $t('hide_your_email.title') }}
      </el-button>
    </el-popover>
  </div>
</template>

<script>
import Vue from "vue";
import relayAPI from '@/api/relay'
export default  Vue.extend({
  props: {
  },
  data () {
    return {
      aliases: [],
      creating: false,
      popoverDisabled: false
    }
  },
  beforeMount() {
    this.getAlias()
  },
  methods: {
    getAlias() {
      relayAPI.get_addresses().then((res) => {
        this.aliases = res.results || []
      }).catch(() => {
        this.aliases = []
      })
    },
    fillUsername(address) {
      this.$emit('fill', address)
      this.popoverDisabled = false
    },
    async handleAddAddress() {
      if (this.creating) {
        return;
      }
      this.creating = true
      await relayAPI.create_address().then(async (res) => {
        this.$emit('fill', res.full_address)
        this.getAlias();
        this.creating = false
      }).catch(() => {
        this.creating = false
        this.$emit('on-error')
      });
      this.popoverDisabled = false
    },
    openPopover() {
      setTimeout(() => {
        this.popoverDisabled = true
      }, 10);
    }
  }
})
</script>

<style lang="scss">
.private-emails {
  margin-top: -8px;
  &--list::-webkit-scrollbar {
    // display: none;
  }
}
</style>
