<template>
  <div id="popup-header"
    class="fixed top-0 w-full"
  >
    <div
      class="h-auto grid grid-cols-5 navigator"
    >
      <router-link
        v-for="item in menu"
        :to="{ name: item.routeName }"
        :key="item.routeName"
        class="text-center text-[14px] navigator-item"
      >
        <img
          class="navigator-item__image"
          :class="item.routeName === $route.name ? 'active' : ''"
          :src="require(`@/assets/images/icons/header/${item.icon}`)"
        >
        <div
          class="navigator-item__title"
          :class="item.routeName === $route.name ? 'text-primary font-semibold' : 'text-black'"
        >
          {{ item.label }}
        </div>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Header',
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  data() {
    return {
    }
  },
  methods: {
  },
  computed: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    menu() {
      return [
        {
          label: this.$t('data.parts.vault'),
          routeName: 'vault',
          icon: 'vault.svg'
        },
        {
          label: this.$t('data.parts.folder'),
          routeName: 'folders',
          icon: 'folder.svg'
        },
        {
          label: this.$t('data.parts.otp'),
          routeName: 'otp',
          icon: 'otp.svg'
        },
        {
          label: this.$t('data.parts.generator'),
          routeName: 'generator',
          icon: 'generator.svg'
        },
        {
          label: this.$t('data.parts.settings'),
          routeName: 'settings',
          icon: 'settings.svg'
        }
      ]
    }
  }
}
</script>

<style lang="scss">
#popup-header {
  z-index: 2000;
  .navigator {
    background-color: white !important;
    padding: 12px 0;
    .navigator-item {
      @apply no-underline;
      &:hover {
        .navigator-item__image {
          filter: invert(36%) sepia(82%) saturate(415%) hue-rotate(78deg) brightness(95%) contrast(91%);
        }
      }
      &__image {
        margin-left: auto;
        margin-right: auto;
        &.active {
          filter: invert(36%) sepia(82%) saturate(415%) hue-rotate(78deg) brightness(95%) contrast(91%);
        }
      }
      &.router-link-exact-active.router-link-active {
        .navigator-item__image {
          filter: invert(36%) sepia(82%) saturate(415%) hue-rotate(78deg) brightness(95%) contrast(91%);
        }
      }
    }
  }
}
</style>

