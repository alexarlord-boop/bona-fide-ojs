
import { ref } from 'vue';
import generateJWT from '../utils/jwt.js';
import {useStorage} from "../composables/useStorage.js";

const secret = new TextEncoder().encode("a-string-secret-at-least-256-bits-long"); // must be at least 256 bits

export function useScoring(getTranslation = null) {
//  const loadingScores = ref(false);
  const loadingScores = ref({});
  const { getStorage } = useStorage("local"); // или "session"

  const timeLimit = ref(10);
  const savedTimeLimit = getStorage("timeLimit");
  if (savedTimeLimit) {
    timeLimit.value = Number(savedTimeLimit);
    console.log("Saved time limit",savedTimeLimit);
  }

  const backendBaseUrl = ref('http://localhost:5000');
  const savedBaseUrl = getStorage("baseUrl");
  if (savedBaseUrl) {
    backendBaseUrl.value = savedBaseUrl;
    console.log("Saved  base url", savedBaseUrl);
  }

    async function fetchUserById(user, userType) {
        console.log("Fetching single user: ", user);
        const rawId = user.id;
        const newUserId = rawId?.toString().startsWith(`${userType}-`)
          ? rawId
          : `${userType}-${rawId}`;
          try {
            loadingScores.value[newUserId] = true;
            const serviceUrl = `${backendBaseUrl.value}/verify-eduperson`;
            const jwt = await generateJWT(user, secret);

            // 1. Start job
            const response = await fetch(serviceUrl, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`,
              },
            });

            // backend sends an array of actors (new bulk feature endpoint)
            const job = await response.json();
            const job_id = job[0].job_id;

            // 2. Poll
            const pollUrl = `${backendBaseUrl.value}/status/${job_id}`;
            let result = null;

            const secondsPerPollAttempt = 2
            const twoSecondsPeriodNumber = timeLimit.value / secondsPerPollAttempt
            for (let attempts = 0; attempts < twoSecondsPeriodNumber; attempts++) {
              const res = await fetch(pollUrl, {
                headers: { "Authorization": `Bearer ${jwt}` },
              });

              const data = await res.json();
              if (data.status === "FINISHED_SUCCESS") {
                result = data.result;
                break;
              } else if (data.status === "FINISHED_ERROR") {
                throw new Error("Job failed");
              } else if (attempts === twoSecondsPeriodNumber && data.status === "RUNNING") {
                throw new Error("Can't fetch all data, please increase the polling time limit.");
              }

              await new Promise(resolve => setTimeout(resolve, secondsPerPollAttempt * 1000));
            }

            // 3. Parse result
            const new_ror_scored_results = result?.email_domain_verification?.ror_scored_results || [];
            const new_candidates = result?.researcher_info?.candidates || [];
            const hasResults = new_ror_scored_results.length > 0 || new_candidates.length > 0;

            const errorMessage = getTranslation ? getTranslation('ui.labels.no_results_backend') : "No new results returned from backend";
            console.log("User error field:", hasResults ? null : errorMessage);

            return {
              id: user.id,
              stringId: newUserId,
              ojsName: user.name || user.ojsName,
              ojsEmail: user.email || user.ojsEmail,
              ojsORCID: user.orcid || user.ojsORCID,
              ror_scored_results: hasResults ? new_ror_scored_results : user?.ror_scored_results || [],
              candidates: hasResults ? new_candidates.map(c => ({
                user: {
                  given_name: c.author?.given_name || "",
                  surname: c.author?.surname || "",
                  orcid: c.author?.orcid || "",
                  affiliations: c.author?.affiliations || [],
                },
                score_breakdown: c.score_breakdown?.author || {},
              })) : user?.candidates || [],
              error: hasResults ? null : errorMessage, // per-user error

            };


          } catch (err) {
            console.error(`Error fetching user ${user.id}:${newUserId}`, err);
            const unknownErrorMessage = getTranslation ? getTranslation('ui.labels.unknown_error') : "Unknown error";
            return {
              id: user.id,
              stringId: newUserId,
              ojsName: user.name || user.ojsName,
              ojsEmail: user.email || user.ojsEmail,
              ojsORCID: user.orcid || user.ojsORCID,
              ror_scored_results: user.ror_scored_results || [],
              candidates: user.candidates || [],
              error: err.message || user.error || unknownErrorMessage,
            };
          } finally {
            loadingScores.value[newUserId] = false;
          }
        }


  return {
    fetchUserById,
    loadingScores
  };

}