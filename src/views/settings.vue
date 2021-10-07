<template>
  <DefaultLayout wrapper-type="wrapper">
    <div class="flex flex-col flex-column-fluid relative bg-[#FBFBFC]">
      <div class="flex-column-fluid lg:px-28 py-10 px-10 mb-20">
        <div class="flex mb-5">
          <router-link
            v-for="(item, index) in menu"
            :key="index"
            :to="{name: item.routeName}"
            active-class="!text-primary"
            class="text-black-600 font-bold mr-8 last:mr-0"
            exact
          >
            {{ $t(`sidebar.${item.label}`) }}
          </router-link>
        </div>
        <router-view />
      </div>
    </div>
  </DefaultLayout>
</template>

<script>
import Vue from 'vue'
import DefaultLayout from '@/components/layout/default'
export default Vue.extend({
  components: {
    DefaultLayout
  },
  props: {
    isError: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    currentPlan () {
      return this.$store.state.currentPlan
    },
    menu () {
      return [
        {
          label: 'general',
          routeName: 'settings'
        },
        {
          label: 'import_export',
          routeName: 'settings-import-export'
        },
        {
          label: 'download',
          routeName: 'settings-download'
        },
        {
          label: 'excluded_domains',
          routeName: 'settings-excluded-domains'
        },
        ...this.currentPlan.alias === 'pm_family_discount'
          ? [{
            label: 'family_members',
            routeName: 'settings-family-members'
          }]
          : []

      ]
    }
  }
})
</script>
