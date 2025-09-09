<template>
    <div class="component">
        <div class="details-btn" @click="fetchAll">
            <span v-if="loading">⏳ {{ t('ui.labels.loading_authors') }}</span>
            <span v-else>↻ {{ t('ui.labels.reload_all') }}</span>
          </div>
        <!--<button class="details-btn" @click="generatePDFReport">Get PDF report</button>-->
        <button class="details-btn" @click="getCachedTrustScoreData">{{ t('ui.labels.get_json_data') }}</button>
        <!--<button class="details-btn" >Get relation graph</button>-->
    </div>
</template>

<script setup>
import { generatePDF } from "../utils/pdfGenerator";
import { useLocale } from "../composables/useLocale.js";

import { useAuthors } from './useAuthors';
import { useReviewers } from "./useReviewers.js";
import {computed, toRef} from "vue";

const props = defineProps({
    submissionId: Number,
    submission: Object
  });

const submissionValue = toRef(props, "submission");
console.log('props in sidebar: ', submissionValue);

const { fetchAuthorsBulk, loadingAuthors } = useAuthors(props.submissionId);
const { fetchReviewersBulk, loadingReviewers } = useReviewers(submissionValue);
import { useStorage } from "./useStorage.js";
const { getStorage, updateStorage, clearStorage } = useStorage();

const { t } = useLocale();


const loading = computed(() => loadingAuthors.value || loadingReviewers.value);

function fetchAll() {
    fetchAuthorsBulk();
    fetchReviewersBulk();
}

function generatePDFReport() {
    const cachedData = getStorage('trustScoreData');
    if (!cachedData) {
        console.error('No cached data found for PDF generation.');
        return;
    }

    const data = JSON.parse(cachedData);
    generatePDF(data);
}

function getCachedTrustScoreData(pretty=true) {
    const cachedData = sessionStorage.getItem('trustScoreData');
    if (!cachedData) {
      console.error('No cached data found.');
      return;
    }

    let jsonString;
    try {
      const parsed = JSON.parse(cachedData);
      jsonString = pretty
        ? JSON.stringify(parsed, null, 2) // 2 пробела для форматирования
        : cachedData;
    } catch (e) {
      console.error('Error parsing JSON from cache:', e);
      jsonString = cachedData; // fallback
    }

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trustScoreData.json';
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
</script>

<style>
.component {
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: row;
  gap: 8px;
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
</style>