(function () {
  if (typeof pkp.Vue === 'undefined' || typeof pkp === 'undefined') {
    console.warn('Vue or PKP not available');
    // console.log('PKP:', pkp);
    // console.log('Vue:', Vue);
   
    return;
  }

  // Register the example-tab component globally
  const Vue = pkp.Vue;
  Vue.component('example-tab', {
    props: {
      initData: {
        type: Object,
        required: true,
      },
    },
    template: `
      <div class="example-tab">
        <h3>Trust Score Overview</h3>
        <div v-if="initData">
          <h4>Authors</h4>
          <ul>
            <li v-for="author in initData.authors" :key="author.name">
              {{ author.name }} – Trust Score: <strong>{{ author.score }}</strong>
            </li>
          </ul>
          <h4>Reviewers</h4>
          <ul>
            <li v-for="reviewer in initData.reviewers" :key="reviewer.name">
              {{ reviewer.name }} – Trust Score: <strong>{{ reviewer.score }}</strong>
            </li>
          </ul>
        </div>
        <div v-else>
          <p>No trust score data provided.</p>
        </div>
      </div>
    `
  });

  // Register with PKP registry
  if (pkp.registry && pkp.registry.set) {
    pkp.registry.set('example-tab', Vue.options.components['example-tab']);
  }
})();
