<template>
  <div>
    <div>
      <span class="text-black-500">
        {{$t('data.settings.autofill_desc')}} <a>
          {{ $t('data.settings.what_is_iframe') }}
        </a>
      </span>
    </div>
    <div class="mt-2">
      <p class="font-semibold">{{ $t('data.settings.show_menu_form') }}</p>
      <div
        v-for="option in autofillMenuOptions"
        :key="option.value"
        class="timeout-option"
        @click="() => handleUpdateShowMenuOption(option.value)"
      >
        <div>
          {{option.label}}
        </div>
        <div
          v-if="showMenuOption === option.value"
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
    </div>
    <div class="mt-2">
      <p class="font-semibold">{{ $t('data.settings.autofill_on_page_load') }}</p>
      <div
        v-for="option in autofillOptions"
        :key="option.value"
        class="timeout-option"
        @click="() => handleUpdateAutofillOption(option.value)"
      >
        <div>
          {{option.label}}
        </div>
        <div
          v-if="autofillOption === option.value"
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
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { AUTOFILL_MENU_OPTIONS, AUTOFILL_OPTIONS } from '@/config/constants';

export default Vue.extend({
  data() {
    return {
      showMenuOption: 'icon_selected',
      autofillOption: 'autofill_page'
    };
  },
  computed: {
    autofillMenuOptions() {
      return AUTOFILL_MENU_OPTIONS;
    },
    autofillOptions() {
      return AUTOFILL_OPTIONS;
    },
  },
  async mounted() {
    const res = await Promise.all([
      this.$storageService.get('showMenuOption'),
      this.$storageService.get('autofillOption'),
    ])
    this.showMenuOption = res[0] || 'icon_selected'
    this.autofillOption = res[1] || 'autofill_page'
  },
  methods: {
    handleUpdateShowMenuOption(value: string) {
      this.showMenuOption = value;
      this.$storageService.save('showMenuOption', value)
    },
    handleUpdateAutofillOption(value: string) {
      this.autofillOption = value;
      this.$storageService.save('autofillOption', value)
    }
  },
});
</script>
