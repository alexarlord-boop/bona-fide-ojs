<template>
    <div class="component">
        <button class="details-btn" >↻ Reload</button>
        <button class="details-btn" @click="generatePDFReport">Get PDF report</button>
        <!--<button class="details-btn" >Get relation graph</button>-->
    </div>
</template>

<script setup>
import { generatePDF } from "../utils/pdfGenerator";

function generatePDFReport() {
    const cachedData = sessionStorage.getItem('trustScoreData');
    if (!cachedData) {
        console.error('No cached data found for PDF generation.');
        return;
    }

    const data = JSON.parse(cachedData);
    generatePDF(data);
}
</script>

<style>
.component {
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.details-btn {
    max-width: 150px;
    padding: 0 15px;
    color:  #1976d2;
    font-size: 0.8rem;
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
</style>