<template>
  <div class="progress">
    <div
      class="progress-bar select-none"
      role="progressbar"
      :class="{
        'bg-success w-full': score === 4,
        'bg-info w-3/4': score === 3,
        'bg-warning w-2/4': score === 2,
        'bg-danger w-1/4': score === 1 || score === 0,
        'bg-black w-0': score === 10,
      }"
    >
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

<style scoped>
.progress {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  height: 0.75rem;
  overflow: hidden;
  line-height: 0;
  font-size: 0.625rem;
  background-color: #EBEDF3;
  border-radius: 2px;
  -webkit-box-shadow: none;
  box-shadow: none;
}
.progress-bar {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  overflow: hidden;
  color: #ffffff;
  text-align: center;
  white-space: nowrap;
  -webkit-transition: width 0.6s ease;
  transition: width 0.6s ease;
}
</style>
