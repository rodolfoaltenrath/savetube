<script setup>
defineProps({
  progress: { type: Number, default: 0 }
})
</script>

<template>
  <div
    class="w-full h-3 bg-white/10 rounded-full overflow-hidden"
    role="progressbar"
    :aria-valuemin="0"
    :aria-valuemax="100"
    :aria-valuenow="Math.floor(Math.max(0, Math.min(100, progress)))"
  >
    <div
      class="h-full bg-brand-save transition-all duration-200"
      :style="{ width: Math.max(0, Math.min(100, progress)) + '%' }"
    />
  </div>
  <p class="text-sm text-slate-300 mt-2">{{ Math.floor(progress) }}%</p>
</template>

<style scoped></style>
