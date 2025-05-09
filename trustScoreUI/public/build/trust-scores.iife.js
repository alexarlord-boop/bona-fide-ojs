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
  
        <h3>Authors</h3>
        <table class="table table-striped table-bordered flex" style="width: 60%;">
          <thead>
            <tr>
              <th style="width: 40%; text-align: left;" >Name</th>
              <th style="width: 40%; text-align: left;" >Email</th>
              <th style="width: 20%;" >Trust Score</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="author in initData.authors" :key="author.name">
              <td>{{ author.name }}</td>
              <td><a :href="'mailto:' + author.email">{{ author.email }}</a></td>
              <td style="text-align: center;"><strong>{{ author.score }}</strong>
             
   
              
              </td>
            </tr>
          </tbody>
        </table>

        <br>
        <hr style="border-top: 3px dashed #bbb;">



        <h3 class="mt-1">Reviewers</h3>
        <table class="table table-striped table-bordered" style="width: 60%;">
          <thead>
            <tr>
              <th style="width: 40%; text-align: left;" >Name</th>
              <th style="width: 40%; text-align: left;" >Email</th>
              <th style="width: 20%;" >Trust Score</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="reviewer in initData.reviewers" :key="reviewer.name">
              <td>{{ reviewer.name }}</td>
              <td><a :href="'mailto:' + reviewer.email">{{ reviewer.email }}</a></td>
              <td style="text-align: center;"><strong>{{ reviewer.score }}</strong></td>
            </tr>
          </tbody>
        </table>
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
