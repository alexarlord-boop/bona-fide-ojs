<template>
    <div class="user-section">
      <h2>{{ title }}</h2>
  
      <div v-if="users.length === 0" class="empty">
        No {{ title.toLowerCase() }} found.
      </div>
  
      <div v-for="(user, index) in users" :key="user.id" class="user-card">
        <div class="user-summary">
          <div class="user-info">
            
            <div class="user-contact">
              <div><strong> {{ user.OJS.name }} </strong></div>
              <div>
                email: 
                <a :href="'mailto:' + user.OJS.email">{{ user.OJS.email }}</a>
              </div>
            </div>
           
          </div>
          <button @click="emit('toggle', index)" class="toggle-btn">
            {{ accordionState[index] ? 'Hide Details' : 'Show Details' }}
          </button>
        </div>
  
        <transition name="fade">
          <div v-if="accordionState[index]" class="user-details">
            <div class="details-btn">↻ Reload</div>
            <!--<div class="details-btn">Get PDF report</div>-->
            <div class="details-btn">Get relation graph</div>
            <div v-if="user.OJS.orcid">
              <strong>ORCID:</strong>
              <a :href="user.OJS.orcid" target="_blank">{{ user.OJS.orcid }}</a>
            </div>
  
            <br/>
      
            <div v-if="user.candidates" class="subscores">
              <div v-for="(cand, ci) in user.candidates" :key="ci" class="candidate-card">
                <!-- Left: info -->
                <div class="user-card info">
                  <div><strong>{{ cand.author.given_name }} {{ cand.author.surname }}</strong></div>
                  <div v-if="cand.author.orcid">
                    ORCID:
                    <a
                      :href="`https://orcid.org/${cand.author.orcid}`"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ cand.author.orcid }}
                    </a>
                  </div>

                  <div
                    v-for="aff in cand.author?.affiliations || []"
                    :key="aff.name"
                    :title="aff.name"
                  >
                    <a
                      :href="aff.ror || '#'"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Click to open ROR page"
                      class="aff-link"
                    >
                    {{ aff.name }}
                    </a>
                  </div>
                </div>

                <!-- Right: scores -->
                <div class="user-card scores">
                  <ScoreBar :subscores="convertScoreBreakdown(cand.score_breakdown, maxOverall)" />
                </div>
              </div>
            </div>
            
          </div>
        </transition>
      </div>
    </div>

  </template>
  
  <script setup>
  import { computed } from "vue";

  import ScoreBar from './ScoreBar.vue';
  const props = defineProps({
    title: String,
    users: Array,
    accordionState: Object
  });
  
  const emit = defineEmits(['toggle']);

  const maxOverall = computed(() => {
    let max = 0;
    for (const user of props.users) {
      if (!user.candidates) continue;
      for (const cand of user.candidates) {
        const val = cand.score_breakdown?.cumulative_rank ?? 0;
        if (val > max) max = val;
      }
    }
    return max;
  });


  function convertSubscoresToArray(subscores) {
    const converted = {};
    for (const [key, value] of Object.entries(subscores)) {
      converted[key] = {
        ...value,
        details: Array.isArray(value.details)
          ? value.details
          : Object.entries(value.details).map(([label, val]) => ({ label, value: val })),
      };
    }
    return converted;
  }


  function convertScoreBreakdown(score, maxOverall) {
    const subscores = {};



     // Name (rank vs max_value)
  if (score.name) {
    subscores.name = {
      total: score.name.max_value,
      details: [
        { label: (score.name.max_value === score.name.rank) ? "Perfect Match" : "Match" , value: score.name.rank }
      ],
    };
  }

    // Affiliations
    if (score.affiliations) {
      subscores.affiliations = {
        total: score.affiliations.cumulative_rank,
        details: [
          { label: "Count", value: score.affiliations.count },
          { label: "Avg Rank", value: score.affiliations.avg_rank_per_affiliation },
        ],
      };
    }

    // Emails
    if (score.emails) {
      subscores.emails = {
        total: score.emails.cumulative_rank || score.emails.count,
        details: [
          { label: "Count", value: score.emails.count },
          { label: "Cumulative", value: score.emails.cumulative_rank },
          { label: "Perfect Match", value: score.emails.perfect_match },
        ],
      };
    }

    // Attributes overall
    if (score.attributes_with_perfect_match !== undefined) {
      subscores.attributes = {
        total: score.attributes_with_perfect_match,
        details: [
          { label: "Attributes w/ perfect match", value: score.attributes_with_perfect_match },
        ],
      };
    }

    // Global score
    if (score.cumulative_rank !== undefined) {
      subscores.overall = {
        total: maxOverall,
        details: [
          { label: "Cumulative Rank", value: score.cumulative_rank },
          { label: "Difference", value: Math.round(maxOverall - score.cumulative_rank) },
        ],
      };
    }

    return subscores;
  }

  </script>
  
  <style scoped>
  .custom-select .aff-text {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px; /* adjust as needed */
  }
  .candidate-card {
    display: grid;
    grid-template-columns: 500px 1fr; /* left fixed width, right flexible */
    gap: 1rem;
    align-items: start;
    margin-bottom: 1.5rem;
  }

  .candidate-card .user-card.info {
    background: #f9f9f9;
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    flex: 0 0 auto;
  }

  .candidate-card .user-card.scores {
    background: transparent; /* or keep white */
    box-shadow: none;
    padding: 0;
  }
  .user-section {
    background: white;
    padding: 1.2rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    font-size: 0.92rem;
  }
  h2 {
    border-bottom: 1px solid #eee;
    padding-bottom: 0.4rem;
    margin-bottom: 1rem;
    font-size: 1.15rem;
  }
  .empty {
    color: #777;
    font-style: italic;
    margin: 0.5rem 0;
  }
  .user-card {
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    margin-bottom: 0.75rem;
    background: #f9f9f9;
    overflow: hidden;
  }

  .user-card .tinted {
    background: #d5f0fa ;
  }
  .user-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 0.8rem;
    background: #f1f5f9;
  }
  .user-info > div {
    margin-bottom: 0.2rem;
    line-height: 1.2;
  }
  .toggle-btn {
    background: #1976d2;
    color: white;
    padding: 0.3em 0.8em;
    font-size: 0.85rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .toggle-btn:hover {
    background: #125ea2;
  }
  .details-btn {
    max-width: 125px;
    margin-right: 10px;
    padding: 5px;
    color:  #1976d2;
    font-size: 0.75rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    float: right; /* Align to the right */
    margin-left: auto; /* Ensure proper alignment */
  }

  .details-btn:hover {
    background: #e3f2fd;
    color: #0d47a1;
  }

  .user-details {
    padding: 0.8rem 1rem;
    background: white;
    font-size: 0.88rem;
    line-height: 1.35;
  }
  .badge {
    background: #e3f2fd;
    color: #1976d2;
    border-radius: 12px;
    padding: 0.15em 0.5em;
    font-weight: 600;
    font-size: 0.85rem;
    margin-left: 0.4em;
  }
  .subscores {
    margin-top: 0.75rem;
  }
  .subscore-bar {
    margin-bottom: 0.4rem;
  }
  .label {
    font-weight: 500;
    margin-bottom: 0.2rem;
  }
  .bar-container {
    background: #eee;
    height: 16px;
    border-radius: 8px;
    overflow: hidden;
  }
  .bar {
    background: #4caf50;
    height: 100%;
    color: white;
    text-align: right;
    padding-right: 6px;
    line-height: 16px;
    font-size: 0.78rem;
    transition: width 0.3s ease;
  }
/* .fade-enter-active,
.fade-leave-active {
transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s;
overflow: hidden;
}
.fade-enter-from,
.fade-leave-to {
max-height: 0;
opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
max-height: 500px; 
opacity: 1;
} */
  </style>
