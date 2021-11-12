<template>
  <div
    class="flex items-center"
    :class="{
      'text-success': score === 4,
      'text-info': score === 3,
      'text-warning': score === 2,
      'text-danger': score === 1 || score === 0,
      'text-black': score === 10,
    }"
  >
    <svg
      v-if="score !==10"
      class="mr-2"
      width="16px"
      height="16px"
      viewBox="0 0 16 16"
      version="1.1"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="icon-check" fill="currentColor">
        <path d="M6.65625 10.9453L4 8.25781L4.9375 7.32031L6.65625 9.03906L11.0625 4.66406L12 5.60156L6.65625 10.9453ZM8 0.257813L2 2.94531L2 6.94531Q2 8.75781 2.78125 10.4453Q3.5625 12.1328 4.9375 13.3203Q6.3125 14.5078 8 14.9453Q9.6875 14.5078 11.0625 13.3203Q12.4375 12.1328 13.2188 10.4453Q14 8.75781 14 6.94531L14 2.94531L8 0.257813Z" />
      </g>
    </svg>
    <div class="font-semibold">
      {{ $t(`master_password.scores.${scores[score]}`) }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    score: {
      type: Number,
      default: 10
    }
  },
  data () {
    return {
      scores: {
        10: 'na',
        0: 'very_weak',
        1: 'weak',
        2: 'medium',
        3: 'good',
        4: 'strong'
      }
    }
  },
  mounted () {
  }
}
</script>
