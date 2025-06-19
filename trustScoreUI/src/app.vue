<template>
    <div>
      <AuthorTable :authors="authors" />
      <!-- <ReviewerTable :reviewers="reviewers" /> -->
      <!-- PDF export button etc. -->
    </div>
  </template>
  
  <script>
  import AuthorTable from './js/components/AuthorTable.vue';
//   import ReviewerTable from './components/ReviewerTable.vue';
  
  export default {
    components: { 
        AuthorTable, 
        // ReviewerTable,
     },
    props: ['initData'],
    data() {
      return {
        authors: this.initData.authors,
        // reviewers: this.initData.reviewers,
        // etc
      };
    }
  };
  </script>
  