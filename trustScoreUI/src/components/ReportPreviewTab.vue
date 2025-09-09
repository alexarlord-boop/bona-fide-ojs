<script setup>
console.log('BUILD TEST: ' + Math.random());
const { useUrl } = pkp.modules.useUrl;
const { useFetch } = pkp.modules.useFetch;
const { useCurrentUser } = pkp.modules.useCurrentUser;
import { ref, watch } from 'vue';
import UserSection from './UserSection.vue'; // Import UserSection component
import generateJWT from '../utils/jwt.js';
import { useLocale } from '../composables/useLocale.js';

import { useStorage } from "../composables/useStorage.js";
const { getStorage, updateStorage } = useStorage();


const cu = useCurrentUser();
console.log('--- Current User Info ---');

console.log('--- Roles ---');
console.log('Has Role:', cu?.hasCurrentUserAtLeastOneRole([16])); // 0=Admin, 1=Manager, 16=Main Editor, 512=Reviewer

const isUserEditor = cu?.hasCurrentUserAtLeastOneRole([16]); // 16=Main Editor

const { t } = useLocale();

// Accordion state for authors and reviewers
const authorAccordion = ref({});
const reviewerAccordion = ref({});

const props = defineProps({
  submissionId: Number,
});

const authors = ref([]);
const reviewers = ref([]);


// Toggle accordion functions
function toggleAuthor(index) {
  authorAccordion.value[index] = !authorAccordion.value[index];
}

function toggleReviewer(index) {
  reviewerAccordion.value[index] = !reviewerAccordion.value[index];
}


// --- NEW: Load JSON file into storage and reactive state ---
const fileInput = ref(null);

function loadJsonFromFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      // Save to storage
      updateStorage('ReportData', data);
      console.log('Loaded JSON into storage:', data);

      // Apply immediately to reactive vars
      if (data.authors) authors.value = data.authors;
      if (data.reviewers) reviewers.value = data.reviewers;

      // Reset accordions so UI is consistent
      authorAccordion.value = {};
      reviewerAccordion.value = {};

    } catch (err) {
      console.error('Error parsing JSON:', err);
      alert(t('ui.labels.invalid_json_file'));
    }
  };
  reader.readAsText(file);
}
</script>

<template>
  <div class="">
    <UserSection v-if="isUserEditor" :forReports="true" userType="author" :title="t('ui.labels.authors')" :users="authors" :bulkLoading="loadingAuthors" :loading="loadingScores" :accordionState="authorAccordion" @toggle="toggleAuthor" @fetchAgainOne="(user) => reloadSingleAuthor(user)"/>
    <UserSection v-if="isUserEditor" :forReports="true" userType="reviewer" :title="t('ui.labels.reviewers')" :users="reviewers" :bulkLoading="loadingReviewers" :loading="loadingScores" :accordionState="reviewerAccordion" @toggle="toggleReviewer"  @fetchAgainOne="(user) => reloadSingleReviewer(user)"/>
  </div>
  <!-- JSON upload button -->
  <div class="mt-4">
    <label class="uploadBtn">
      {{ t('ui.labels.load_json_report') }}
      <input type="file" accept=".json" @change="loadJsonFromFile" style="display:none"/>
    </label>
  </div>

</template>

<style scoped>
.uploadBtn {
  background-color: #1976d2;
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.25s ease;
}
.uploadBtn:hover {
  background-color: #1565c0;
}
</style>