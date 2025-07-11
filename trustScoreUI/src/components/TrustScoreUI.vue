<script setup>
console.log('BUILD TEST: ' + Math.random());
const { useUrl } = pkp.modules.useUrl;
const { useFetch } = pkp.modules.useFetch;
import { ref, watch } from 'vue';

const props = defineProps({
  submissionId: Number,
});

// Init reactibe values for template
const submissionData = ref({});
const authors = ref([]);
const reviewers = ref([]);


// Fetch submission data from the API
const {apiUrl: submissionApiUrl} = useUrl(`submissions/${props.submissionId}`);
const { data: submission, fetch: fetchSubmission } = useFetch(submissionApiUrl);

fetchSubmission().then(() => {
  console.log('Fetched submission data:', submission.value);
  submissionData.value = submission.value;
}).catch(error => {
  console.error('Error fetching submission data:', error);
});


// Fetch submission publication data from the API
const {apiUrl: submissionPublicationApiUrl} = useUrl(`submissions/${props.submissionId}/publications/${props.submissionId}`);
const { data: publication, fetch: fetchSubmissionPublication } = useFetch(submissionPublicationApiUrl);

// Fetch authors from the submission.publication
const fetchAuthors = async () => {
  fetchSubmissionPublication().then(() => {
  console.log('Fetched publication data:', publication.value);
    authors.value = publication.value?.authors || [];
  }).catch(error => {
    console.error('Error fetching publication data:', error);
  });
}


// Fetch reviewers users by ID from the submission.reviewAssignments
const fetchReviewers = async () => {
  if (submission.value && submission.value.reviewAssignments) {
    const ids = submission.value.reviewAssignments.map(assignment => assignment.reviewerId);
    for (const id of ids) {
      // Fetch user by ID
      const { apiUrl: userApiUrl } = useUrl(`users/${id}`);
      const { data: user, fetch: fetchUser } = useFetch(userApiUrl);
      await fetchUser();
      reviewers.value.push(user.value);
    }
    
    console.log('Fetched reviewers:', reviewers);
  } else {
    console.warn('No review assignments found in submission data.');
  }
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
  <div>
    <pre>{{ authors }}</pre>
    <pre>{{ reviewers }}</pre>
  </div>
</template>
