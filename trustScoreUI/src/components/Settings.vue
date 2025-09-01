<template>
  <div class="p-4">
    <h4 class="mb-2">Backend Base URL</h4>
    <input
      type="text"
      v-model="baseUrl"
      @blur="saveBaseUrl"
      placeholder="http://localhost:5000"
      class="border p-1"
    />
    <br/>
    <br/>
    <br/>
    <h4 class="mb-2">Time limit for backend polling</h4>
    <input
      type="range"
      min="1"
      max="60"
      step="1"
      v-model="timeLimit"
      @input="saveTime"
    />
    <span class="ml-2">{{ timeLimit }} sec</span>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useStorage } from "./useStorage.js";

const { getStorage, updateStorage } = useStorage("local");

const timeLimit = ref(10); // default

onMounted(() => {
  const savedUrl = getStorage("baseUrl");
  if (savedUrl) baseUrl.value = savedUrl;

  const savedTime = getStorage("timeLimit");
  if (savedTime) timeLimit.value = Number(savedTime);
});

function saveBaseUrl() {
  updateStorage("baseUrl", baseUrl.value);
}

function saveTime() {
  updateStorage("timeLimit", timeLimit.value);
}

</script>

<style scoped>
input[type="range"] {
  width: 200px;
}
</style>
