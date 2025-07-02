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


const submissionUrl = computed(() => getApiUrl(`submissions/${props.submissionId}/publications/${props.submissionId}`));
console.log('submissionUrl:', submissionUrl.value);

const { data: submissionData, fetch: fetchSubmission } = useFetch(submissionUrl, {});


const authors = ref([]);
const hasAuthors = computed(() => authors.value.length > 0);


onMounted(() => {
  if (props.submissionId) {
    fetchSubmission();
  }
});

watch(submissionData, (newVal) => {
  console.log('submissionData changed:', newVal);
  const rawAuthors = newVal?.authors;
  authors.value = Array.isArray(rawAuthors)
    ? rawAuthors
    : Object.values(rawAuthors ?? {});
  console.log('Updated authors:', authors.value);
});



</script>

<template>
  <div>
    <h3>Authors</h3>
    <p v-if="submissionData && submissionData.authors">
      <span v-if="hasAuthors">Authors found:</span>
      <ul>
        <li v-for="author in submissionData.authors" :key="author.id">
          {{ author.fullName }} <a href="#">{{ author.email }}</a>
        </li>
      </ul>
    </p>
  </div>
</template>
