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
      max="300"
      step="60"
      v-model="timeLimit"
      @input="saveTime"
    />
    <span class="ml-2">{{ timeLimit }} sec</span>

    <br/>
    <br/>
    <br/>
    <div class="mt-6">
      <button
        @click="clearStorage"
        class="clearBtn"
      >
        Clear cache
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useStorage } from "./useStorage.js";

const { getStorage, updateStorage, clearAll } = useStorage("local");

const timeLimit = ref(1); // default
const baseUrl = ref("");

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

function clearStorage() {
  clearAll();
  baseUrl.value = "";
  timeLimit.value = 1;
}

</script>

<style scoped>
input[type="range"] {
  width: 200px;
}

.clearBtn {
  background-color: #e53935;
  color: white;
  padding: 3px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.25s ease, transform 0.1s ease;
}

.clearBtn:hover {
  background-color: #c62828;
}

.clearBtn:active {
  transform: scale(0.95);
}
</style>
