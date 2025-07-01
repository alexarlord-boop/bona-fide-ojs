<template>
    <div>
      TrustScoreUI content — submissionId: {{ submissionId }}
    </div>
  </template>

<script setup>
import { ref } from 'vue';


const props = defineProps({
	submissionId: Number
});

const scoreMessage = ref('Loading trust score...');

// Симуляция получения trust score
setTimeout(() => {
	scoreMessage.value = `Submission #${props.submissionId} has a trust score of 85%`;
}, 1000);
</script>

<style scoped>
.custom-score-box {
	padding: var(--spacing-4);
	background-color: var(--color-stage-in-review);
	border-radius: var(--rounded-md);
}
.custom-heading {
	font: var(--font-lg-bold);
	color: var(--text-color-heading);
	margin-bottom: var(--spacing-2);
}
</style>
