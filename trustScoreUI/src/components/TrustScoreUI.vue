<script setup>
import { ref, nextTick, computed, onMounted, watch } from 'vue';

const { useFetch } = pkp.modules.useFetch;

const props = defineProps({
  submissionId: Number,
});

function getApiUrl(path) {
  const { protocol, host, pathname } = window.location;
  const pathParts = pathname.split('/').filter(Boolean);
  const indexPhpIndex = pathParts.indexOf('index.php');
  const contextPath = pathParts[indexPhpIndex + 1];
  return `${protocol}//${host}/index.php/${contextPath}/api/v1/${path}`;
}

// Submission data
const submissionUrl = computed(() =>
  getApiUrl(`submissions/${props.submissionId}/publications/${props.submissionId}`)
);
const { data: submissionData, fetch: fetchSubmission } = useFetch(submissionUrl, {});

// Assignment data (contains reviewers)
const assignmentUrl = computed(() =>
  getApiUrl(`submissions/${props.submissionId}`)
);
const { data: assignmentData, fetch: fetchAssignment } = useFetch(assignmentUrl, {});

// Reviewers
const reviewers = ref([]);

// Fetch user details by ID
const getUserById = async (userId) => {
  try {
    const userUrl = getApiUrl(`users/${userId}`);
    const response = await fetch(userUrl);
    if (!response.ok) throw new Error('Failed to fetch user');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return null;
  }
};

// Fetch all reviewers
const fetchReviewers = async (assignments) => {
  if (!assignments?.length) {
    console.warn('No reviewAssignments found.');
    return;
  }

  const reviewerPromises = assignments.map(async (assignment) => {
    try {
      const user = await getUserById(assignment.reviewerId);
      return {
        id: assignment.reviewerId,
        givenName: user?.givenName,
        familyName: user?.familyName,
        email: user?.email,
        orcid: user?.orcid,
      };
    } catch (e) {
      console.error('Failed to fetch reviewer', assignment.reviewerId, e);
      return { id: assignment.reviewerId, error: true };
    }
  });

  reviewers.value = await Promise.all(reviewerPromises);
};

watch(reviewers, (val) => {
  console.log('reviewers updated:', val);
});

// watch(
//   () => assignmentData.value?.reviewAssignments,
//   async (assignments) => {
//     if (!assignments?.length) return;
//     console.log('reviewAssignments loaded:', assignments);
//     await fetchReviewers();
//   },
//   { immediate: true, deep: true }
// );
// onMounted(async () => {
//   if (!props.submissionId) return;

//   await fetchSubmission();
//   await fetchAssignment();

//   console.log('assignmentData:', assignmentData.value);

//   await fetchReviewers();

//   console.log('reviewers:', reviewers.value);
// });
onMounted(async () => {
  if (!props.submissionId) return;
  await fetchSubmission();
  await fetchAssignment();
  await nextTick(); // на всякий случай

  const assignments = assignmentData.value?.reviewAssignments;
  console.log('Assignments before passing to fetchReviewers:', assignments);
  await fetchReviewers(assignments);
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
    <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Surname</th>
        <th>Email</th>
        <th>ORCID</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="test in [1,2,3]" :key="test">
  <td colspan="4">test {{ test }}</td>
</tr>
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
  <pre>{{ JSON.stringify(reviewers, null, 2) }}</pre>
  <pre>{{ reviewers.map(r => r.givenName?.en).join(', ') }}</pre>
  <pre>reviewers.length: {{ reviewers.length }}</pre>
<pre>reviewers[0]: {{ reviewers[0] }}</pre>
<pre>{{ assignmentData }}</pre>
<pre>{{ assignmentData?.reviewAssignments }}</pre>

  </div>
</template>
