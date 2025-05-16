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

  data() {
    return {
      trustScores: {
        authors: [], // Populated by PHP
        reviewers: [], // Populated by PHP
      },
    };
  },
  mounted() {
    // Fetch updated scores asynchronously
    this.fetchScores('author', this.trustScores.authors);
    this.fetchScores('reviewer', this.trustScores.reviewers);
  },
  methods: {
    async fetchScores(role, users) {
      try {
        const response = await fetch('http://fastapi:8000/bulk-verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role, users }),
        });
        const data = await response.json();
        if (data && data.users) {
          console.log('Fetched scores:', data.users);
          // Update scores dynamically
          users.forEach((user, index) => {
            user.score = data.users[index].score;
          });
        }
      } catch (error) {
        console.error('Error fetching scores:', error);
      }
    },

    async exportToPDF() {
      try {
        const response = await fetch('http://fastapi/export-pdf', {
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
};
</script>

<style scoped>
.example-tab {
  padding: 1rem;
}
</style>
