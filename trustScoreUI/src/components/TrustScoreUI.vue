<script setup>
console.log('BUILD TEST: ' + Math.random());
const { useUrl } = pkp.modules.useUrl;
const { useFetch } = pkp.modules.useFetch;
import { ref, watch } from 'vue';
import UserSection from './UserSection.vue'; // Import UserSection component
import styles from './test.module.css'; // Import CSS module

// Accordion state for authors and reviewers
const authorAccordion = ref({});
const reviewerAccordion = ref({});

const props = defineProps({
  submissionId: Number,
});

// Init reactive values for template
const submissionData = ref({});
const authors = ref([]);
const reviewers = ref([]);

// Fetch submission data from the API
const { apiUrl: submissionApiUrl } = useUrl(`submissions/${props.submissionId}`);
const { data: submission, fetch: fetchSubmission } = useFetch(submissionApiUrl);

fetchSubmission().then(() => {
  console.log('Fetched submission data:', submission.value);
  submissionData.value = submission.value;
}).catch(error => {
  console.error('Error fetching submission data:', error);
});

// Fetch submission publication data from the API
const { apiUrl: submissionPublicationApiUrl } = useUrl(`submissions/${props.submissionId}/publications/${props.submissionId}`);
const { data: publication, fetch: fetchSubmissionPublication } = useFetch(submissionPublicationApiUrl);

// Fetch authors from the submission.publication
const fetchAuthors = async () => {
  try {
    await fetchSubmissionPublication();
    console.log('Fetched publication data:', publication.value);

    const authorIds = (publication.value?.authors || []).map(author => ({
      id: author.id,
      name: author.fullName,
      email: author.email,
      
      // more details
      orcid: author.orcid || '',
      affiliations: author.affiliations || [],

      score: 0,
    }));

    console.log('Sending JSON for authors:', JSON.stringify({ role: 'author', users: authorIds }));


    if (authorIds.length > 0) {
      const response = await fetch('http://localhost:8000/bulk-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'author', users: authorIds }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      const data = await response.json();
      authors.value = data.users.map(user => ({
        ...user,
        subscores: user.subscores, // Use subscores from backend
      }));
    }
  } catch (error) {
    console.error('Error fetching authors or subscores:', error);
  }
};

// Fetch reviewers users by ID from the submission.reviewAssignments
const fetchReviewers = async () => {
  if (submission.value && submission.value.reviewAssignments) {
    const ids = submission.value.reviewAssignments.map(assignment => assignment.reviewerId);
    for (const id of ids) {
      // Fetch user by ID
      const { apiUrl: userApiUrl } = useUrl(`users/${id}`);
      const { data: user, fetch: fetchUser } = useFetch(userApiUrl);
      await fetchUser();
      // Add mock subscores to each reviewer
      reviewers.value.push({
        ...user.value,
        subscores: {}
      });
    }

    console.log('Fetched reviewers data:', reviewers.value);

    const reviewerIds = reviewers.value.map(reviewer => ({
        id: reviewer.id,
        name: reviewer.fullName || '', // Fallback if name is missing
        email: reviewer.email || '', // Fallback if email is missing
      }));

    console.log('Sending JSON for reviewers:', JSON.stringify({ role: 'reviewer', users: reviewerIds }));

    if (reviewerIds.length > 0) {
      const response = await fetch('http://localhost:8000/bulk-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'reviewer', users: reviewerIds }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      const data = await response.json();
      reviewers.value = data.users.map(user => ({
        ...user,
        subscores: user.subscores, // Use subscores from backend
      }));
    }

    console.log('Fetched reviewers:', reviewers);
  } else {
    console.warn('No review assignments found in submission data.');
  }
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
watch(submission, (newSubmission) => {
  if (newSubmission) {
    fetchAuthors();
    fetchReviewers();

    console.log('authors', authors);
    console.log('reviewers', reviewers);
  }
});
</script>

<template>
  <div class="">
    <UserSection title="Authors" :users="authors" :accordionState="authorAccordion" @toggle="toggleAuthor" />
    <UserSection title="Reviewers" :users="reviewers" :accordionState="reviewerAccordion" @toggle="toggleReviewer" />
  </div>
</template>
