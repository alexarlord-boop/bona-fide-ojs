<script setup>
import { ref, computed, watch, onMounted } from 'vue';

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
console.log('submissionUrl:', submissionUrl.value);
const { data: submissionData, fetch: fetchSubmission } = useFetch(submissionUrl, {});
console.log('submissionData:', submissionData);

const authors = ref([]);
const hasAuthors = computed(() => authors.value.length > 0);


// reviewers fetch 
console.log(window.pkp.currentUser);
const assignmentUrl = computed(() => getApiUrl(`submissions/${props.submissionId}/`));
console.log('assignmentUrl:', assignmentUrl.value);
const { data: assignmentData, fetch: fetchAssignment } = useFetch(assignmentUrl, {});
console.log('assignmentData:', assignmentData);
// console.log('reviewers:', assignmentData?.value.reviewAssignments?.value);


onMounted(() => {
  if (props.submissionId) {
    fetchSubmission();
    fetchAssignment();
  }
  
});

// watch(submissionData, (newVal) => {
//   console.log('submissionData changed:', newVal);
//   const rawAuthors = newVal?.authors;
//   authors.value = Array.isArray(rawAuthors)
//     ? rawAuthors
//     : Object.values(rawAuthors ?? {});
//   console.log('Updated authors:', authors.value);
// });



</script>

<template>
  <div>
    <h3>Authors</h3>
    <p v-if="submissionData && submissionData.authors">
      
      <ul>
        <li v-for="author in submissionData.authors" :key="author.id">
          {{ author.fullName }} <a href="#">{{ author.email }}</a>
        </li>
      </ul>
    </p>
    <h3>Reviewers</h3>
    <p v-if="assignmentData && assignmentData.reviewAssignments">
      
      <ul>
        <li v-for="reviewer in assignmentData.reviewAssignments" :key="reviewer.id">
          <!-- {{ author.fullName }} <a href="#">{{ author.email }}</a> -->
            <pre>{{ reviewer.reviewerFullName }}</pre>
        </li>
      </ul>
    </p>
  </div>
</template>
