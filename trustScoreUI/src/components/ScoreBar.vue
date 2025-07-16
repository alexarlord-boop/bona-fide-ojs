<template>
  <div v-if="subscores" class="subscores space-y-4">
    <div
      v-for="(scoreData, label) in subscores"
      :key="label"
      class="subscore"
    >
      <div class="label text-lg font-semibold mb-1">
        {{ label }} ({{ scoreData.total }})
      </div>

      <div class="bar-container bg-gray-200 rounded h-6 relative overflow-hidden">
        <div
          v-for="(detail, index) in scoreData.details"
          :key="detail.label"
          class="bar-detail absolute top-0 h-full text-xs text-white px-1 flex items-center"
          :style="getBarStyle(scoreData.details, index, scoreData.total)"
          :title="detail.label + ' (' + detail.value + ')'"
        >
          <template v-if="shouldShowLabel(detail.value, scoreData.total)">
            {{ detail.label }} ({{ detail.value }})
          </template>
          <template v-else>
            {{ detail.value }}
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['subscores']);

function getBarStyle(details, index, total) {
  const prevWidth = details.slice(0, index).reduce((sum, d) => sum + d.value, 0);
  const currentWidth = (details[index].value / total) * 100;
  return {
    left: (prevWidth / total) * 100 + '%',
    width: currentWidth + '%',
    backgroundColor: pickColor(index),
  };
}

function pickColor(index) {
  const colors = ['#4ade80', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa'];
  return colors[index % colors.length];
}

function shouldShowLabel(value, total) {
  const percent = (value / total) * 100;
  return percent >= 20; // show label only if width >= 20%
}
</script>

<style scoped>
.bar-container {
  position: relative;
}

.bar-detail {
  white-space: nowrap;
  font-size: 0.75rem;
  line-height: 1rem;
}
</style>
