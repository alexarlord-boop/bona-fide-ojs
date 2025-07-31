<script setup>
console.log('BUILD TEST: ' + Math.random());
const { useUrl } = pkp.modules.useUrl;
const { useFetch } = pkp.modules.useFetch;
const { useCurrentUser } = pkp.modules.useCurrentUser;
import { ref, watch } from 'vue';
import UserSection from './UserSection.vue'; // Import UserSection component
import styles from './test.module.css'; // Import CSS module

const cu = useCurrentUser();
console.log('--- Current User Info ---');
// console.log('ID:', cu?.getCurrentUserId());
// console.log('Name:', cu?.getCurrentUserName());
// console.log('Full Name:', cu?.getCurrentUserFullName());
// console.log('Initials:', cu?.getCurrentUserInitials());

// console.log('--- Logged in As Info ---');
// console.log('Logged In As (object):', cu?.getUserLoggedInAs());
// console.log('Logged In As UserName:', cu?.getUserLoggedInAsUserName());
// console.log('Logged In As Initials:', cu?.getUserLoggedInAsInitials());

console.log('--- Roles ---');
console.log('Has Role:', cu?.hasCurrentUserAtLeastOneRole([16])); // 0=Admin, 1=Manager, 16=Main Editor, 512=Reviewer
// console.log('Has Role In Stage (e.g., stage 1):', cu?.hasCurrentUserAtLeastOneAssignedRoleInStage(1, [512]));
// console.log('Has Role In Any Stage:', cu?.hasCurrentUserAtLeastOneAssignedRoleInAnyStage(512));
// console.log('Is Reviewer:', cu?.isCurrentUserAssignedAsReviewer(1)); // stageId

// console.log('--- Notifications ---');
// console.log('Unread Notifications:', cu?.getUnreadNotifications());

const isUserEditor = cu?.hasCurrentUserAtLeastOneRole([16]); // 16=Main Editor

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
  // console.log('Fetched submission data:', submission.value);
  submissionData.value = submission.value;
}).catch(error => {
  // console.error('Error fetching submission data:', error);
});

// Fetch submission publication data from the API
const { apiUrl: submissionPublicationApiUrl } = useUrl(`submissions/${props.submissionId}/publications/${props.submissionId}`);
const { data: publication, fetch: fetchSubmissionPublication } = useFetch(submissionPublicationApiUrl);

// Helper function to randomize subscores
function randomizeSubscores(categories, total) {
  const subscores = {};
  let remaining = total;

  categories.forEach((category, index) => {
    if (index === categories.length - 1) {
      subscores[category] = remaining;
    } else {
      const score = Math.floor(Math.random() * remaining);
      subscores[category] = score;
      remaining -= score;
    }
  });

  return subscores;
}

// Fetch authors from the submission.publication
const fetchAuthors = async () => {
  try {
    await fetchSubmissionPublication();
    const authorIds = (publication.value?.authors || []).map(author => ({
      id: author.id,
      name: author.fullName,
      email: author.email,
      orcid: author.orcid || '',
      affiliations: author.affiliations || [],
    }));

    if (authorIds.length > 0) {
      const response = await fetch('http://localhost:8000/bulk-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'author', users: authorIds }),
      });

      if (!response.ok) throw new Error(`Backend error: ${response.statusText}`);

      const data = await response.json();
      authors.value = data.users.map(user => ({
        ...user,
        subscores: user.subscores, // Use subscores from backend
      }));
    }
  } catch (error) {
    console.warn('Error fetching authors or subscores:', error);
    alert('Backend is unavailable. Using mock data for authors.');
    console.log('Using mock data for authors.');
    authors.value = (publication.value?.authors || []).map(author => ({
      id: author.id,
      name: author.fullName,
      email: author.email,
      orcid: author.orcid || '',
      affiliations: author.affiliations || [],
      subscores: {
        Reputation: {
          total: 200,
          details: randomizeSubscores(
            ["Academic Presence", "Educator Career", "Journalism", "Other", "Something"],
            200
          ),
        },
        Activity: {
          total: 70,
          details: randomizeSubscores(["Forum Posts", "Events Attended"], 70),
        },
        Verification: {
          total: 90,
          details: randomizeSubscores(["ID Verified", "Institutional Email"], 90),
        },
      },
    }));
  }
};

// Fetch reviewers users by ID from the submission.reviewAssignments
const fetchReviewers = async () => {
  try {
    if (submission.value && submission.value.reviewAssignments) {
      const ids = submission.value.reviewAssignments.map(assignment => assignment.reviewerId);
      const reviewerData = [];

      for (const id of ids) {
        const { apiUrl: userApiUrl } = useUrl(`users/${id}`);
        const { data: user, fetch: fetchUser } = useFetch(userApiUrl);
        await fetchUser();
        reviewerData.push({
          id: user.value.id,
          name: user.value.fullName || '',
          email: user.value.email || '',
        });
      }

      if (reviewerData.length > 0) {
        const response = await fetch('http://localhost:8000/bulk-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'reviewer', users: reviewerData }),
        });

        if (!response.ok) throw new Error(`Backend error: ${response.statusText}`);

        const data = await response.json();
        reviewers.value = data.users.map(user => ({
          ...user,
          subscores: user.subscores, // Use subscores from backend
        }));
      }
    } else {
      console.warn('No review assignments found in submission data.');
    }
  } catch (error) {
    console.warn('Error fetching reviewers or subscores:', error);
    alert('Backend is unavailable. Using mock data for reviewers.');
    console.log('Using mock data for reviewers.');
    reviewers.value = (submission.value?.reviewAssignments || []).map(assignment => ({
      id: assignment.reviewerId,
      name: `Reviewer ${assignment.reviewerId}`,
      email: '',
      subscores: {
        Reputation: {
          total: 200,
          details: randomizeSubscores(
            ["Academic Presence", "Educator Career", "Journalism", "Other", "Something"],
            200
          ),
        },
        Activity: {
          total: 70,
          details: randomizeSubscores(["Forum Posts", "Events Attended"], 70),
        },
        Verification: {
          total: 90,
          details: randomizeSubscores(["ID Verified", "Institutional Email"], 90),
        },
      },
    }));
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
    <UserSection v-if="isUserEditor" title="Authors" :users="authors" :accordionState="authorAccordion" @toggle="toggleAuthor" />
    <UserSection v-if="isUserEditor" title="Reviewers" :users="reviewers" :accordionState="reviewerAccordion" @toggle="toggleReviewer" />
  </div>
</template>
