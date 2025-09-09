<template>
    <div class="user-section">
      <h2>{{ title }}</h2>

      <!-- Bulk loader -->
      <div v-if="bulkLoading" class="flex justify-center p-4">
        <span class="loader">Loading {{ title }}...</span>
      </div>
  


       <!-- Users list -->
      <div v-else>
        <div v-if="users?.length === 0" class="empty">
          {{ title.toLowerCase() === 'authors' ? t('ui.labels.no_authors_found') : t('ui.labels.no_reviewers_found') }}
        </div>
  
        <div v-for="(user, index) in users" :key="user.id" class="user-card">
          <div class="user-summary">
            <div class="user-info">

              <div class="user-contact">
                <div><strong> {{ user?.ojsName }} </strong></div>
                <span v-if="typeof user.error === 'string'" class="error-msg">⚠ {{ user.error }}</span>
                <div>
                  email:
                  <a :href="'mailto:' + user?.ojsEmail">{{ user?.ojsEmail }}</a>
                </div>
              </div>

            </div>
            <button @click="emit('toggle', index)" class="toggle-btn">
              {{ accordionState[index] ? t('ui.labels.hide_details') : t('ui.labels.show_details') }}
            </button>
          </div>

          <transition name="fade">
            <div v-if="accordionState[index]" class="user-details">
              <div v-if="!forReports" class="details-section">
                <div class="details-btn" @click="emit('fetchAgainOne', user)">
                  <span v-if="props.loading[user.stringId]">⏳ {{ t('ui.labels.loading') }}</span>
                  <span v-else>↻ {{ t('ui.labels.reload') }}</span>
                </div>
                <!--<div class="details-btn">Get PDF report</div>-->
                <div class="details-btn">{{ t('ui.labels.get_relation_graph') }}</div>
                <div v-if="user?.ojsORCID">
                  <strong>{{ t('ui.labels.orcid') }}:</strong>
                  <a :href="user?.ojsORCID" target="_blank">{{ user?.ojsORCID }}</a>
                </div>
              </div>

              <br/>

              <div v-if="user?.ror_scored_results && user.ror_scored_results.length > 0 && user.ror_scored_results[0][1]" class="">
                <ScoreBar :subscores="convertRorScoreToBreakdown(user.ror_scored_results[0][1], 100, getScoreLabel)" />
              </div>

              <div v-if="user.candidates" class="subscores">
                <div v-for="(cand, ci) in user.candidates" :key="ci" class="candidate-card">
                  <!-- Left: info -->
                  <div class="user-card info">
                    <div><strong>{{ cand?.user?.given_name }} {{ cand?.user?.surname }}</strong></div>
                    <div v-if="cand?.user?.orcid">
                      {{ t('ui.labels.orcid') }}:
                      <a
                        :href="`https://orcid.org/${cand.user.orcid}`"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {{ cand.user.orcid }}
                      </a>
                    </div>

                    <div
                      v-for="aff in cand.user?.affiliations || []"
                      :key="aff.name"
                      :title="aff.name"
                    >
                      <a
                        :href="aff.ror || '#'"
                        target="_blank"
                        rel="noopener noreferrer"
                        :title="t('ui.labels.click_to_open_ror')"
                        class="aff-link"
                      >
                      {{ aff.name }}
                      </a>
                    </div>
                  </div>

                  <!-- Right: scores -->
                  <div class="">
                    <ScoreBar :subscores="convertBaseScoreBreakdown(cand.score_breakdown, maxOverall, getScoreLabel)" />
                  </div>
                </div>
              </div>

            </div>
          </transition>
        </div>
      </div>
    </div>

  </template>
  
  <script setup>
  import { computed } from "vue";
  import {convertRorScoreToBreakdown, convertBaseScoreBreakdown} from '../utils/scoresToBarConverter.js';
  import { useLocale } from '../composables/useLocale.js';

  import ScoreBar from './ScoreBar.vue';
  
  const { getScoreLabel, t } = useLocale();
  
  const props = defineProps({
    forReports: Boolean,
    title: String,
    userType: String,
    users: Array,
    accordionState: Object,
    loading: Object,
    bulkLoading: Boolean,
  });
  
  const emit = defineEmits(['toggle', 'fetchAgainOne']);

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
  .details-section {

        display: flex;
    flex-direction: row;
    gap: 8px;
    padding: 10px;
  }
  .details-btn {
    max-width: 220px;
    min-width: 120px;
    padding: 8px 15px;
    color:  #1976d2;
    font-size: 0.8rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    text-align: center;
    transition: all 0.2s ease;
    align-self: flex-end;
}

  .details-btn:hover {
    background: #e3f2fd;
    color: #0d47a1;
  }

  .user-details {
/*    max-height: 400px;*/
/*    overflow-y: auto;*/
    padding: 0 1rem;
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

  .error-msg {
    color: #d32f2f;
    font-size: 0.8rem;
    margin-left: 0.5rem;
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
