<script setup>
console.log('BUILD TEST: ' + Math.random());
const { useUrl } = pkp.modules.useUrl;
const { useFetch } = pkp.modules.useFetch;
const { useCurrentUser } = pkp.modules.useCurrentUser;
import { ref, watch } from 'vue';
import UserSection from './UserSection.vue'; // Import UserSection component
import generateJWT from '../utils/jwt.js';



const cu = useCurrentUser();
console.log('--- Current User Info ---');

console.log('--- Roles ---');
console.log('Has Role:', cu?.hasCurrentUserAtLeastOneRole([16])); // 0=Admin, 1=Manager, 16=Main Editor, 512=Reviewer

const isUserEditor = cu?.hasCurrentUserAtLeastOneRole([16]); // 16=Main Editor

// Accordion state for authors and reviewers
const authorAccordion = ref({});
const reviewerAccordion = ref({});

const props = defineProps({
  submissionId: Number,
});

// Init reactive values for template
const submissionData = ref({});
//const authors = ref([]);
//const reviewers = ref([]);

// Fetch submission data from the API
const { apiUrl: submissionApiUrl } = useUrl(`submissions/${props.submissionId}`);
const { data: submission, fetch: fetchSubmission } = useFetch(submissionApiUrl);

fetchSubmission().then(() => {
  // console.log('Fetched submission data:', submission.value);
  submissionData.value = submission.value;
}).catch(error => {
  // console.error('Error fetching submission data:', error);
});

import { useScoring } from './useScoring.js';
const { fetchUserById, loadingScores } = useScoring();

import { useAuthors } from './useAuthors';
const { authors, loadingAuthors, fetchAuthorsBulk } = useAuthors(props.submissionId);

import { useReviewers } from "./useReviewers.js";
const { reviewers, fetchReviewersBulk, loadingReviewers } = useReviewers(submission);

import { useStorage } from "./useStorage.js";
const { getStorage, updateStorage } = useStorage();

const reloadSingleAuthor = async (user) => {
  const updated = await fetchUserById( user, 'author');

  const idx = authors.value.findIndex(a => a.id === updated.id);
  if (idx !== -1) {
    authors.value[idx] = {
    ...authors.value[idx],
    error: updated.error,
    candidates: updated.candidates,  // only update candidates
  };
  }
  console.log(`Updated: author`, updated);
};

const reloadSingleReviewer = async (user) => {
  const updated = await fetchUserById( user, 'reviewer');

  const idx = reviewers.value.findIndex(a => a.id === updated.id);
  if (idx !== -1) {
    reviewers.value[idx] = {
    ...reviewers.value[idx],
    error: updated.error,
    candidates: updated.candidates,  // only update candidates
  };
  }
  console.log(`Updated: reviewer`, updated);
};

watch([authors, reviewers], () => {
  if (authors.value?.length && reviewers.value?.length) {
    updateStorage('trustScoreData', {
      authors: authors.value,
      reviewers: reviewers.value,
      submissionId: props.submissionId,
      submissionTitle: submissionData.value.title || 'Untitled Submission',
    });
  }
}, { deep: true });


// Toggle accordion functions
function toggleAuthor(index) {
  authorAccordion.value[index] = !authorAccordion.value[index];
}

function toggleReviewer(index) {
  reviewerAccordion.value[index] = !reviewerAccordion.value[index];
}

// Update reactive values when requested data changes
// submission --> publication --> authors
// submission --> reviewerAssignments --> reviewers
watch(submission, async (newSubmission) => {
  if (!newSubmission) return; // still no submission data
  if (!newSubmission.reviewAssignments) return; // still no necessary field
  if (newSubmission) {

    try {
      const parsed = getStorage('trustScoreData');

      // If both authors and reviewers are cached, just load them
      if (parsed?.authors?.length && parsed?.reviewers?.length) {
        authors.value = parsed.authors;
        reviewers.value = parsed.reviewers;
      } else {
        // Build promises depending on what's missing
        const promises = [];
        if (!parsed?.authors?.length) {
          promises.push(fetchAuthorsBulk());
        } else {
          authors.value = parsed.authors;
        }

        if (!parsed?.reviewers?.length) {
          promises.push(fetchReviewersBulk());
        } else {
          reviewers.value = parsed.reviewers;
        }

        // Run them in parallel
        await Promise.all(promises);
      }

      // Store data in sessionStorage after all requests succeed
      console.log('authors', authors.value);
      console.log('reviewers', reviewers.value);
      if (authors.value?.length && reviewers.value?.length) {
        const trustScoreData = {
          authors: authors.value,
          reviewers: reviewers.value,
          submissionId: props.submissionId,
          submissionTitle: submissionData.value.title || 'Untitled Submission',
        };
        updateStorage('trustScoreData', trustScoreData);
        console.log(trustScoreData);
      }
    } catch (error) {
      console.error('Error storing data in sessionStorage:', error);
    }

  }
});

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
      updateStorage('trustScoreData', data);
      console.log('Loaded JSON into storage:', data);

      // Apply immediately to reactive vars
      if (data.authors) authors.value = data.authors;
      if (data.reviewers) reviewers.value = data.reviewers;

      // Reset accordions so UI is consistent
      authorAccordion.value = {};
      reviewerAccordion.value = {};

    } catch (err) {
      console.error('Error parsing JSON:', err);
      alert('Invalid JSON file.');
    }
  };
  reader.readAsText(file);
}
</script>

<template>
  <div class="">
    <UserSection v-if="isUserEditor" userType="author" title="Authors" :users="authors" :bulkLoading="loadingAuthors" :loading="loadingScores" :accordionState="authorAccordion" @toggle="toggleAuthor" @fetchAgainOne="(user) => reloadSingleAuthor(user)"/>
    <UserSection v-if="isUserEditor" userType="reviewer" title="Reviewers" :users="reviewers" :bulkLoading="loadingReviewers" :loading="loadingScores" :accordionState="reviewerAccordion" @toggle="toggleReviewer"  @fetchAgainOne="(user) => reloadSingleReviewer(user)"/>
  </div>
  <!-- JSON upload button -->
  <div class="mt-4">
    <label class="uploadBtn">
      Load JSON Report
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