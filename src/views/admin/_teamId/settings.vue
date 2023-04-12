<template>
  <div class="flex flex-col flex-column-fluid relative bg-[#FBFBFC]">
    <div class="flex-column-fluid lg:px-28 py-10 px-10 mb-20">
      <div class="flex mb-5">
        <router-link
          v-for="(item, index) in menu"
          :key="index"
          :to="{name: item.routeName, params: $route.params}"
          active-class="!text-primary"
          class="text-black-600 font-bold mr-8 last:mr-0"
          exact
        >
          {{ $t(`sidebar.${item.label}`) }}
        </router-link>
      </div>
      <router-view  />
    </div>
  </div>
</template>

<script>
export default {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data () {
    return {
      menu: [
        {
          label: 'general',
          routeName: 'admin-teamId-settings'
        },
        {
          label: 'import_export',
          routeName: 'admin-teamId-settings-import-export'
        }
      ]
    }
  }
}
</script>
