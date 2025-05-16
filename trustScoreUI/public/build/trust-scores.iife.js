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

    data() {
      return {
        authors: this.initData.authors.map(author => ({
          ...author,
          score: '-1', // Initial placeholder for scores
        })),
        reviewers: this.initData.reviewers.map(reviewer => ({
          ...reviewer,
          score: '-1', // Initial placeholder for scores
        })),
      };
    },
    mounted() {
      // Fetch updated scores asynchronously
      this.fetchScores('author', this.authors);
      this.fetchScores('reviewer', this.reviewers);
    },
    methods: {
      async fetchScores(role, users) {
        try {
          const response = await fetch('http://localhost:8000/bulk-verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role, users }),
          });
          const data = await response.json();
          if (data && data.users) {
            // console.log('Fetched scores:', data.users);
            // Update scores dynamically
            users.forEach((user, index) => {
              user.score = data.users[index].score;
            });
          }
        } catch (error) {
          console.error('Error fetching scores:', error);
          // Handle error by setting scores to "Error"
          users.forEach(user => {
            user.score = 'Error';
          });
        }
      },
      async exportToPDF() {
        try {
          const response = await fetch('http://localhost:8000/export-pdf', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              authors: this.authors,
              reviewers: this.reviewers
            }),
          });
      
          if (!response.ok) throw new Error('PDF generation failed');
      
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
      
          // Create download link
          const a = document.createElement('a');
          a.href = url;
          a.download = 'trust-report.pdf';
          document.body.appendChild(a);
          a.click();
          a.remove();
      
          // Clean up
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Failed to export PDF:', error);
          alert('Failed to export PDF');
        }
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
            <tr v-for="author in authors" :key="author.name">
              <td>{{ author.name }}</td>
              <td><a :href="'mailto:' + author.email">{{ author.email }}</a></td>
              <td style="text-align: center;">
                <PkpBadge label="trust score">
                  <template v-if="author.score === '-1'">
                    <PkpSpinner/>
                  </template>
                  <template v-else>
                    <strong>{{ author.score }}</strong>
                  </template>
                </PkpBadge>
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
            <tr v-for="reviewer in reviewers" :key="reviewer.name">
              <td>{{ reviewer.name }}</td>
              <td><a :href="'mailto:' + reviewer.email">{{ reviewer.email }}</a></td>
              <td style="text-align: center;">
                <PkpBadge label="trust score">
                  <template v-if="reviewer.score === '-1'">
                    <PkpSpinner/>
                  </template>
                  <template v-else>
                    <strong>{{ reviewer.score }}</strong>
                  </template>
                </PkpBadge>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else>
          <p>No trust score data provided.</p>
        </div>

        <PkpHeader>
        
          <template slot="actions">
             <PkpButton @click="exportToPDF">Export PDF</PkpButton>
          </template>
        </PkpHeader>
      </div>
    `
  });

  // Register with PKP registry
  if (pkp.registry && pkp.registry.set) {
    pkp.registry.set('example-tab', Vue.options.components['example-tab']);
  }


  
})();
