<script setup>
import { ref } from 'vue';

const props = defineProps(['subscores']);

const hoveredDetail = ref(null);
const mouseX = ref(0);
const mouseY = ref(0);

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
  return percent >= 20;
}

function handleMouseEnter(detail, event) {
  hoveredDetail.value = detail;
  mouseX.value = event.pageX;
  mouseY.value = event.pageY;
}

function handleMouseLeave() {
  hoveredDetail.value = null;
}
</script>

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
          @mouseenter="(e) => handleMouseEnter(detail, e)"
          @mousemove="(e) => handleMouseEnter(detail, e)"
          @mouseleave="handleMouseLeave"
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

    <!-- Tooltip -->
    <div
      v-if="hoveredDetail"
      class="tooltip"
      :style="{ top: mouseY + 10 + 'px', left: mouseX + 10 + 'px' }"
    >
      <strong>{{ hoveredDetail.label }}</strong>: {{ hoveredDetail.value }}
    </div>
  </div>
</template>

<style scoped>
.bar-container {
  position: relative;
}

.bar-detail {
  white-space: nowrap;
  font-size: 0.75rem;
  line-height: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.bar-detail:hover {
  opacity: 0.85;
}

/* Tooltip styles */
.tooltip {
  position: fixed;
  z-index: 9999;
  background: rgba(33, 33, 33, 0.95);
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  pointer-events: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
</style>
