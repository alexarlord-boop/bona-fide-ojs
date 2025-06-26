<template>
  <div class="example-tab">
    <h3>Authors</h3>
    <table class="table table-striped table-bordered flex" style="width: 100%;">
      <thead>
        <tr>
          <th style="width: 20%; text-align: left;">Name</th>
          <th style="width: 20%; text-align: left;">Email</th>
          <th style="width: 30%; text-align: left;">Affiliation</th>
          <th style="width: 20%; text-align: left;">
            <img src="https://orcid.org/sites/default/files/images/orcid_16x16.png" alt="ORCID" style="vertical-align: middle;">
            ORCID
          </th>
          <th style="width: 10%;">Trust Score
            <PkpTooltip
              tooltip="Trust score based on author's reputation, past performance and relations."
              label="Tooltip for the author trust score."
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(author, index) in authors" :key="author.name">
          <tr>
            <td @click="toggleAccordion(index)" style="cursor: pointer;">
              {{ author.name }}
              <span v-if="accordionState[index]">▼</span>
              <span v-else>▶</span>
            </td>
            <td><a :href="'mailto:' + author.email">{{ author.email }}</a></td>
            <td style="line-height: 17px; line-break: loose; padding-right: 5px;">{{ author.affiliation.en }}</td>
            <td>
              <a v-if="author.orcid" :href="author.orcid" target="_blank">
                {{ author.orcid.split('/').pop() }}
              </a>
            </td>
            <td style="text-align: center;">
              <PkpBadge label="trust score" :class="getScoreClass(author.score)">
                <template v-if="author.score === '-1'">
                  <PkpSpinner />
                </template>
                <template v-else>
                  <strong>{{ author.score }}</strong>
                </template>
              </PkpBadge>
            </td>
          </tr>
          <tr v-if="accordionState[index]">
            <td colspan="5">
              <div class="accordion-content">
                <div class="progress-bar-container">
                  <strong>Affiliation Score:</strong>
                  <span v-if="author.score !== '-1'">{{ parseFloat(author.score) }} / 100</span>
                  <PkpProgressBar :value="author.score === '-1' ? 0 : parseFloat(author.score)" :max="100" />
                </div>
                <div class="progress-bar-container">
                  <strong>Reputation Score:</strong>
                  <span v-if="author.score !== '-1'">{{ (parseFloat(author.score) * 0.8).toFixed(2) }} / 100</span>
                  <PkpProgressBar :value="author.score === '-1' ? 0 : parseFloat(author.score) * 0.8" :max="100" />
                </div>
                <div class="progress-bar-container">
                  <strong>Performance Score:</strong>
                  <span v-if="author.score !== '-1'">{{ (parseFloat(author.score) * 0.6).toFixed(2) }} / 100</span>
                  <PkpProgressBar :value="author.score === '-1' ? 0 : parseFloat(author.score) * 0.6" :max="100" />
                </div>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <br>
    <hr style="border-top: 3px dashed #bbb;">

    <h3 class="mt-1">Reviewers</h3>
    <table class="table table-striped table-bordered" style="width: 100%;">
      <thead>
        <tr>
          <th style="width: 25%; text-align: left;">Name</th>
          <th style="width: 25%; text-align: left;">Email</th>
          <th style="width: 20%; text-align: left;">Affiliation</th>
          <th style="width: 20%; text-align: center;"></th>
          <th style="width: 10%;">Trust Score
            <PkpTooltip
              tooltip="Trust score based on reviewer's reputation, past performance and relations."
              label="Tooltip for the reviewer trust score."
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="reviewer in reviewers" :key="reviewer.name">
          <td>{{ reviewer.name }}</td>
          <td><a :href="'mailto:' + reviewer.email">{{ reviewer.email }}</a></td>
          <td>{{ reviewer.affiliation.en }}</td>
          <td></td>
          <td style="text-align: center;">
            <PkpBadge label="trust score" :class="getScoreClass(reviewer.score)">
              <template v-if="reviewer.score === '-1'">
                <PkpSpinner />
              </template>
              <template v-else>
                <strong>{{ reviewer.score }}</strong>
              </template>
            </PkpBadge>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- <div v-else>
      <p>No trust score data provided.</p>
    </div> -->

    <PkpHeader>
      <template #actions>
        <PkpButton @click="exportToPDF">Export PDF</PkpButton>
      </template>
    </PkpHeader>
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

  data() {
    return {
      authors: this.initData.authors.map((author) => ({
        ...author,
        score: '-1',
      })),
      reviewers: this.initData.reviewers.map((reviewer) => ({
        ...reviewer,
        score: '-1',
      })),
      editor: this.initData.editor,
      journal_title: this.initData.journal_title,
      submission_id: this.initData.submission_id,
      submission_title: this.initData.submission_title,
      accordionState: {},
    };
  },
  mounted() {
    this.fetchScores('author', this.authors);
    this.fetchScores('reviewer', this.reviewers);
    console.log('Mounted example-tab component with initial data:', this.initData);
  },
  methods: {
    toggleAccordion(index) {
      this.$set(this.accordionState, index, !this.accordionState[index]);
    },
    getScoreClass(score) {
      if (score === 'Error') return 'score-error';
      const numeric = parseFloat(score);
      if (isNaN(numeric)) return 'score-unknown';
      if (numeric >= 80) return 'score-high';
      if (numeric >= 50) return 'score-medium';
      return 'score-low';
    },
    async fetchScores(role, users) {
      try {
        const response = await fetch('http://localhost:8000/bulk-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, users }),
        });
        const data = await response.json();
        if (data && data.users) {
          users.forEach((user, index) => {
            user.score = data.users[index].score;
          });
        }
      } catch (error) {
        console.error('Error fetching scores:', error);
        users.forEach((user) => (user.score = 'Error'));
      }
    },
    async exportToPDF() {
      try {
        const response = await fetch('http://localhost:8000/export-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authors: this.authors,
            reviewers: this.reviewers,
            editor: this.editor,
            journal_title: this.journal_title,
            submission_id: this.submission_id,
            submission_title: this.submission_title,
          }),
        });
        if (!response.ok) throw new Error('PDF generation failed');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'trust-report.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Failed to export PDF:', error);
        alert('Failed to export PDF');
      }
    },
  },
};
</script>

<style scoped>
/* placeholder */
</style>