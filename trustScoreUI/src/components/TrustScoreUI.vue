<script setup>
import { ref, computed, watch, onMounted, watchEffect } from 'vue';

const { useFetch } = pkp.modules.useFetch;

const props = defineProps({
  submissionId: Number,
});

console.log('props.submissionId:', props.submissionId);

function getApiUrl(path) {
  const { protocol, host, pathname } = window.location;
  const pathParts = pathname.split('/').filter(Boolean);
  const indexPhpIndex = pathParts.indexOf('index.php');
  const contextPath = pathParts[indexPhpIndex + 1];
  return `${protocol}//${host}/index.php/${contextPath}/api/v1/${path}`;
};

// authors fetch
const submissionUrl = computed(() => getApiUrl(`submissions/${props.submissionId}/publications/${props.submissionId}`));
// console.log('submissionUrl:', submissionUrl.value);
const { data: submissionData, fetch: fetchSubmission } = useFetch(submissionUrl, {});
// console.log('submissionData:', submissionData);

const authors = ref([]);
const hasAuthors = computed(() => authors.value.length > 0);


// reviewers fetch 
console.log(window.pkp.currentUser);
const assignmentUrl = computed(() => getApiUrl(`submissions/${props.submissionId}/`));
// console.log('assignmentUrl:', assignmentUrl.value);
const { data: assignmentData, fetch: fetchAssignment } = useFetch(assignmentUrl, {});
console.log('assignmentData:', assignmentData);


// console.log('reviewers:', assignmentData?.value.reviewAssignments?.value);
onMounted(async () => {
  if (props.submissionId) {
    await fetchSubmission();
    const res = await fetchAssignment();
    console.log('assignmentData after fetch:', assignmentData.value);
  }
});

console.log(getApiUrl('users/2'));
const getUserById = async (userId) => {
  const userUrl = getApiUrl(`users/${userId}`);
  const response = await fetch(userUrl);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
};

const reviewers = ref([]);

// Fetch reviewer user data after assignments are loaded
const fetchReviewers = async () => {
  if (assignmentData.value && assignmentData.value.reviewAssignments) {
    const assignments = assignmentData.value.reviewAssignments;
    const reviewerPromises = assignments.map(async (assignment) => {
      try {
        const user = await getUserById(assignment.reviewerId);
        console.log('Fetched user for reviewerId:', assignment.reviewerId, user);
        if (!user || !user.id) {
          console.warn('User not found for reviewerId:', assignment.reviewerId);
          return { id: assignment.reviewerId, error: true };
        }
        return {
          id: assignment.reviewerId,
          givenName: user.givenName,
          familyName: user.familyName,
          email: user.email,
          orcid: user.orcid,
        };
      } catch (e) {
        console.error('Failed to fetch user for reviewerId:', assignment.reviewerId, e);
        return { id: assignment.reviewerId, error: true };
      }
    });
    reviewers.value = await Promise.all(reviewerPromises);
    console.log('reviewers after fetch:', reviewers.value);
  }
};



// const reviewersDetails = ref({});

// const fetchReviewerDetails = async (reviewerId) => {
//   const userUrl = getApiUrl(`users/${reviewerId}`);
//   const response = await fetch(userUrl);
//   if (!response.ok) return null;
//   return response.json();
// };

// const fetchAllReviewerDetails = async () => {
//   if (assignmentData.value && assignmentData.value.reviewAssignments) {
//     const promises = assignmentData.value.reviewAssignments.map(async (assignment) => {
//       const details = await fetchReviewerDetails(assignment.reviewerId);
//       if (details) {
//         reviewersDetails.value[assignment.reviewerId] = details;
//       }
//     });
//     await Promise.all(promises);
//     console.log('reviewersDetails after fetch:', reviewersDetails.value);
//   }
// };

watch(
  () => assignmentData.value && assignmentData.value.reviewAssignments,
  (newVal) => {
    if (newVal) {
      fetchAllReviewerDetails();
    }
  },
  { immediate: true }
);

onMounted(async () => {
  if (props.submissionId) {
    await fetchSubmission();
    await fetchAssignment();
    await fetchReviewers();
  }
});

</script>

<template>
  <div>
    <h3>Authors</h3>
    <table v-if="submissionData && submissionData.authors">
      <thead>
        <tr>
          <th>Name</th>
          <th>Surname</th>
          <th>Email</th>
          <th>ORCID</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="author in submissionData.authors" :key="author.id">
          <td>{{ author.givenName?.en || author.givenName || '-' }}</td>
          <td>{{ author.familyName?.en || author.familyName || '-' }}</td>
          <td><a :href="'mailto:' + author.email">{{ author.email }}</a></td>
          <td>
            <a v-if="author.orcid" :href="'https://orcid.org/' + author.orcid" target="_blank">{{ author.orcid }}</a>
            <span v-else>-</span>
          </td>
        </tr>
      </tbody>
    </table>

    <h3>Reviewers</h3>
    <!-- <pre>{{ assignmentData }}</pre> -->
    <table v-if="assignmentData && assignmentData.reviewAssignments">
      <thead>
        <tr>
          <th>Name</th>
          <th>Surname</th>
          <th>Email</th>
          <th>ORCID</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="reviewer in reviewers" :key="reviewer.id">
          <td>{{ reviewer.givenName?.en || reviewer.givenName || '-' }}</td>
          <td>{{ reviewer.familyName?.en || reviewer.familyName || '-' }}</td>
          <td><a :href="'mailto:' + reviewer.email">{{ reviewer.email }}</a></td>
          <td>
            <a v-if="reviewer.orcid" :href="'https://orcid.org/' + reviewer.orcid" target="_blank">{{ reviewer.orcid }}</a>
            <span v-else>-</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
