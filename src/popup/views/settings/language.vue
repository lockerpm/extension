<template>
  <div>
    <div
      v-for="option in languageOptions"
      :key="option.value"
      class="timeout-option"
      @click="() => handleChangeLanguage(option.value)"
    >
      <div>
        {{$t(option.label)}}
      </div>
      <div
        v-if="language == option.value"
        class="text-primary cursor-pointer"
        style="font-size: 8px; line-height: 8px; padding: 5px; border-radius: 50%; border: 1px solid green"
      >
        <i
          class="fas fa-circle"
        />
      </div>
      <div
        v-else
        class="cursor-pointer"
        style="width: 20px; height: 20px; border-radius: 50%; border: 1px solid #A2A3A7"
      />
    </div>
    <div class="text-center">
      <a
        href="https://cystack.notion.site/Locker-Translation-Guide-bb4e4fc4c23d4bbc994375035b124829"
        target="_blank"
        style="color: #005AE4"
      >
        {{$t('data.settings.dont_find_language')}}
      </a>
    </div>
  </div>
</template>

<script lang="js">
import Vue from "vue";
import { LANGUAGE_OPTIONS } from '@/config/constants';

export default Vue.extend({
  data() {
    return {
    };
  },
  computed: {
    languageOptions() {
      return LANGUAGE_OPTIONS;
    },
  },
  methods: {
    handleChangeLanguage(value) {
      this.changeLang(value)
    },
  },
});
</script>
