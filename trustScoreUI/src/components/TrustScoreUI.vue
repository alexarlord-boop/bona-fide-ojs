<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  submissionId: Number,
  initData: Object // Accept initData as a prop
});

const dataReady = ref(false);
const trustScores = ref(props.initData || {});

watch(() => props.initData, (newData) => {
  trustScores.value = newData;
  console.log('Updated trustScores:', trustScores.value);
});

console.log('BUILD TEST: ' + Math.random());
setTimeout(() => {
  dataReady.value = true;
  console.log('Set dataReady to true');
}, 2000);
</script>

<template>
  <div>
    <pre>dataReady: {{ dataReady }}</pre>
    <pre>trustScores: {{ trustScores }}</pre>
    <div v-if="dataReady">DATA READY!</div>
  </div>
</template>