<template>
  <div class="p-4">
    <h4 class="mb-2">Time limit for backend polling</h4>
    <input
      type="range"
      min="1"
      max="60"
      step="1"
      v-model="timeLimit"
      @input="save"
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
  const saved = getStorage("timeLimit");
  if (saved) {
    timeLimit.value = Number(saved);
  }
});

function save() {
  updateStorage("timeLimit", timeLimit.value);
}
</script>

<style scoped>
input[type="range"] {
  width: 200px;
}
</style>
