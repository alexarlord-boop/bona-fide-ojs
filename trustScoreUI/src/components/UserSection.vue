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
              <div><strong> {{ user.fullName }} </strong></div>
              <div>
                email: 
                <a :href="'mailto:' + user.email">{{ user.email }}</a>
              </div>
            </div>
           
          </div>
          <button @click="emit('toggle', index)" class="toggle-btn">
            {{ accordionState[index] ? 'Hide Details' : 'Show Details' }}
          </button>
        </div>
  
        <transition name="fade">
          <div v-if="accordionState[index]" class="user-details">
            <div v-if="user.orcid">
              <strong>ORCID:</strong>
              <a :href="user.orcid" target="_blank">{{ user.orcid }}</a>
            </div>
  
            <div v-if="user.subscores" class="subscores">
              <ScoreBar  :subscores="user.subscores"/>
            
            </div>
            
          </div>
        </transition>
      </div>
    </div>
  </template>
  
  <script setup>
  import ScoreBar from './ScoreBar.vue';
  defineProps({
    title: String,
    users: Array,
    accordionState: Object
  });
  
  const emit = defineEmits(['toggle']);
  </script>
  
  <style scoped>
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
