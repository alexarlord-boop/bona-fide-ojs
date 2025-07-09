<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  submissionId: Number,
  initData: {
    type: Object,
    default: () => ({})
  }
});

// Extract authors and reviewers from the initData prop
const authors = computed(() => props.initData?.authors || []);
const reviewers = computed(() => props.initData?.reviewers || []);

// Debug logging
onMounted(() => {
  console.log('=== TrustScoreUI Debug Info ===');
  console.log('Props received:', props);
  console.log('initData:', props.initData);
  console.log('Authors count:', authors.value.length);
  console.log('Reviewers count:', reviewers.value.length);
  console.log('Authors:', authors.value);
  console.log('Reviewers:', reviewers.value);
  console.log('==============================');
});
</script>

<template>
  <div>
    <h3>Authors</h3>
    <table v-if="authors.length > 0">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>ORCID</th>
          <th>Affiliation</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="author in authors" :key="author.id">
          <td>{{ author.name || '-' }}</td>
          <td><a :href="'mailto:' + author.email">{{ author.email }}</a></td>
          <td>
            <a v-if="author.orcid" :href="'https://orcid.org/' + author.orcid" target="_blank">{{ author.orcid }}</a>
            <span v-else>-</span>
          </td>
          <td>{{ author.affiliation || '-' }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else>No authors found.</p>

    <h3>Reviewers</h3>
    <table v-if="reviewers.length > 0">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Affiliation</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="reviewer in reviewers" :key="reviewer.id">
          <td>{{ reviewer.name || '-' }}</td>
          <td><a :href="'mailto:' + reviewer.email">{{ reviewer.email }}</a></td>
          <td>{{ reviewer.affiliation || '-' }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else>No reviewers found.</p>

    <!-- Debug information -->
    <div style="margin-top: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 4px;">
      <h4>Debug Information:</h4>
      <p><strong>Submission ID:</strong> {{ submissionId }}</p>
      <p><strong>Authors count:</strong> {{ authors.length }}</p>
      <p><strong>Reviewers count:</strong> {{ reviewers.length }}</p>
      <p><strong>InitData available:</strong> {{ !!props.initData ? 'Yes' : 'No' }}</p>
      <p><strong>InitData keys:</strong> {{ Object.keys(props.initData || {}).join(', ') }}</p>
    </div>
  </div>
</template>
