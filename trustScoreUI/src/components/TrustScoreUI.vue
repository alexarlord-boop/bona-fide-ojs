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

const reloadSingleUser = async (user, userType) => {
  const updated = await fetchUserById(user.OJS || user);

  let arrayToChange = null;
  switch (userType) {
    case 'author':
      arrayToChange = authors;
      break;
    case 'reviewer':
      arrayToChange = reviewers;
      break;
  }

  const idx = arrayToChange.value.findIndex(a => a.id === updated.id);
  if (idx !== -1) {
    arrayToChange.value[idx] = updated;
  }
  console.log(`Updated: ${userType}`, updated);
};


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
  if (newSubmission) {

    try {
      const parsed = getStorage('trustScoreData');

      if (parsed?.authors && parsed?.authors?.length !== 0) {
        authors.value = parsed?.authors;
      } else {
        await fetchAuthorsBulk();
      }

      if (parsed?.reviewers && parsed?.reviewers?.length !== 0) {
        reviewers.value = parsed?.reviewers;
      } else {
        await fetchReviewersBulk();
      }

      // Store data in sessionStorage after all requests succeed
      const trustScoreData = {
        authors: authors.value,
        reviewers: reviewers.value,
        submissionId: props.submissionId,
        submissionTitle: submissionData.value.title || 'Untitled Submission',
      };
      if (authors.value?.length !== 0 && reviewers.value?.length !== 0) {
        updateStorage('trustScoreData', trustScoreData);
      }


    } catch (error) {
      console.error('Error storing data in sessionStorage:', error);
    }
  }
});
</script>

<template>
  <div class="">
    <UserSection v-if="isUserEditor" userType="author" title="Authors" :users="authors" :loading="loadingScores" :accordionState="authorAccordion" @toggle="toggleAuthor" @fetchAgainOne="(user, userType) => reloadSingleUser(user, userType)"/>
    <UserSection v-if="isUserEditor" userType="reviewer" title="Reviewers" :users="reviewers" :loading="loadingScores" :accordionState="reviewerAccordion" @toggle="toggleReviewer"  @fetchAgainOne="(user, userType) => reloadSingleUser(user, userType)"/>
  </div>
</template>
