<script setup>
import { ref } from 'vue';
import { useLocale } from '../composables/useLocale.js';

const props = defineProps(['subscores']);

const { t } = useLocale();

const hoveredScoreData = ref(null);
const hoveredLabel = ref('');
const mouseX = ref(0);
const mouseY = ref(0);

function getBarStyle(details, index, total) {
    if (!Array.isArray(details)) {
        console.error("Expected 'details' to be an array, but got:", details);
        details = Object.entries(details).map(([label, value]) => ({ label, value })); // Convert object to array
    }

    const value = details[index].value;
    if (value === 0) return null;

    const scaled = Math.log(value + 1); // log(1) = 0, log(10) > log(2), etc.
    const totalScaled = details.reduce((sum, d) => sum + Math.log(d.value + 1), 0);

    const left = details
    .slice(0, index)
    .reduce((sum, d) => sum + Math.log(d.value + 1), 0) / totalScaled;

    const width = scaled / totalScaled;

    return {
    left: (left * 100).toFixed(2) + '%',
    width: (width * 100).toFixed(2) + '%',
    backgroundColor: pickColor(index),
    };
}

function pickColor(index) {
  const colors = ['#4ade80', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa'];
  return colors[index % colors.length];
}

// function shouldShowLabel(value, total) {
//   if (value <= 0) return false;
//   const percent = (value / total) * 100;

//   const scaled = Math.log10(value + 1) / Math.log10(total + 1);
//   return scaled >= 0.3;
// }

function shouldShowLabel(value, details) {
  if (!Array.isArray(details)) {
    console.error("Expected 'details' to be an array, but got:", details);
    return false;
  }

  if (value <= 0) return false;

  const scaledValue = Math.log(value + 1);
  const totalScaled = details.reduce((sum, d) => sum + Math.log(d.value + 1), 0);
  const percent = (scaledValue / totalScaled) * 100;

  return percent >= 8;
}

function handleMouseEnter(scoreData, label, event) {
  hoveredScoreData.value = scoreData;
  hoveredLabel.value = label;
  mouseX.value = event.pageX;
  mouseY.value = event.pageY;
}

function handleMouseLeave() {
  hoveredScoreData.value = null;
  hoveredLabel.value = '';
}

function getClass(value) {
  return `bar-detail absolute top-0 h-full text-xs text-white px-1 flex items-center ${value > 0 ? '' : 'hidden'}`;
}

function translateScoreCategory(category) {
  // Map score categories to translation keys
  const categoryMap = {
    'name': 'ui.labels.name',
    'attributes': 'ui.labels.attributes',
    'affiliations': 'ui.labels.affiliations',
    'emails': 'ui.labels.emails',
    'overall': 'ui.labels.overall',
    'domain': 'ui.labels.domain'
  };
  
  return categoryMap[category] ? t(categoryMap[category]) : category;
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
        {{ translateScoreCategory(label) }} ({{ scoreData.total }})
      </div>

      <div class="bar-container bg-gray-200 rounded h-6 relative overflow-hidden">
        <div
          v-for="(detail, index) in scoreData.details"
          :key="detail.label"
          :class="getClass(detail.value)"
          :style="getBarStyle(scoreData.details, index, scoreData.total)"
          @mouseenter="(e) => handleMouseEnter(scoreData, label, e)"
          @mousemove="(e) => handleMouseEnter(scoreData, label, e)"
          @mouseleave="handleMouseLeave"
        >
          <template v-if="shouldShowLabel(detail.value, scoreData.details)">
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
      v-if="hoveredScoreData"
      class="tooltip"
      :style="{ top: mouseY + 12 + 'px', left: mouseX + 12 + 'px' }"
    >
      <div class="font-semibold mb-1">{{ translateScoreCategory(hoveredLabel) }} — total: {{ hoveredScoreData.total }}</div>
      <div v-for="(detail, i) in hoveredScoreData.details" :key="detail.label" class="tooltip-row">
        <span
          class="color-dot"
          :style="{ backgroundColor: pickColor(i) }"
        />
        <span class="detail-label">{{ detail.label }}:</span>
        <span class="detail-value">{{ detail.value }}</span>
      </div>
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
  min-width: 50px;
}
.bar-detail:hover {
  opacity: 0.85;
}

/* Tooltip */
.tooltip {
  position: fixed;
  z-index: 9999;
  background: rgba(33, 33, 33, 0.95);
  color: white;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  pointer-events: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  min-width: 180px;
}
.tooltip-row {
  display: flex;
  align-items: center;
  margin: 2px 0;
}
.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
}
.detail-label {
  flex: 1;
  font-weight: 400;
}
.detail-value {
  font-weight: 600;
}
</style>
