<template>
  <div class="p-4">
    <h4 class="mb-2">{{ t('ui.settings.backend_base_url') }}</h4>
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
    <h4 class="mb-2">{{ t('ui.settings.time_limit_polling') }}</h4>
    <input
      type="range"
      min="1"
      max="601"
      step="60"
      v-model="timeLimit"
      @input="saveTime"
    />
    <span class="ml-2">{{ timeLimit }} sec</span>

    <br/>
    <br/>
    <br/>
    <h4 class="mb-2">{{ t('ui.settings.language') }}</h4>
    <select
      v-model="selectedLocale"
      @change="saveLocale"
      class="border p-1"
    >
      <option
        v-for="locale in availableLocales"
        :key="locale.code"
        :value="locale.code"
      >
        {{ locale.name }}
      </option>
    </select>

    <br/>
    <br/>
    <br/>
    <div class="mt-6">
      <button
        @click="clearStorage"
        class="clearBtn"
      >
        {{ t('ui.settings.clear_cache') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useStorage } from "../composables/useStorage.js";
import { useLocale } from "../composables/useLocale.js";

const { getStorage, updateStorage, clearAll } = useStorage("local");
const { currentLocale, availableLocales, setLocale, t } = useLocale();

const timeLimit = ref(1); // default
const baseUrl = ref("");
const selectedLocale = ref(currentLocale.value);

onMounted(() => {
  const savedUrl = getStorage("baseUrl");
  if (savedUrl) baseUrl.value = savedUrl;

  const savedTime = getStorage("timeLimit");
  if (savedTime) timeLimit.value = Number(savedTime);
  
  selectedLocale.value = currentLocale.value;
});

function saveBaseUrl() {
  updateStorage("baseUrl", baseUrl.value);
}

function saveTime() {
  updateStorage("timeLimit", timeLimit.value);
}

function saveLocale() {
  setLocale(selectedLocale.value);
}

function clearStorage() {
  clearAll();
  baseUrl.value = "";
  timeLimit.value = 1;
  selectedLocale.value = "en";
  setLocale("en");
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
