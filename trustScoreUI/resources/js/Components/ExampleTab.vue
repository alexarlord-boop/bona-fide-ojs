<template>
  <div class="example-tab">
    <h3>Authors</h3>
    <ul>
      <li v-for="author in initData.authors" :key="author.name">
        {{ author.name }} - <strong>Trust Score:</strong> {{ author.score }}
      </li>
    </ul>

    <h3>Reviewers</h3>
    <ul>
      <li v-for="reviewer in initData.reviewers" :key="reviewer.name">
        {{ reviewer.name }} - <strong>Trust Score:</strong> {{ reviewer.score }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'ExampleTab',
  props: {
    initData: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
.example-tab {
  padding: 1rem;
}
</style>
