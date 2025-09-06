
import { ref } from 'vue';
import generateJWT from '../utils/jwt.js';
import {useStorage} from "./useStorage.js";

const secret = new TextEncoder().encode("a-string-secret-at-least-256-bits-long"); // must be at least 256 bits

export function useScoring() {
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

            for (let attempts = 0; attempts < timeLimit.value; attempts++) {
              const res = await fetch(pollUrl, {
                headers: { "Authorization": `Bearer ${jwt}` },
              });

              const data = await res.json();
              if (data.status === "FINISHED_SUCCESS") {
                result = data.result;
                break;
              } else if (data.status === "FINISHED_ERROR") {
                throw new Error("Job failed");
              }

              await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // 3. Parse result
            const ror_scored_results = result?.email_domain_verification?.ror_scored_results || [];
            const candidates = result?.researcher_info?.candidates || [];
            return {
              id: user.id,
              stringId: newUserId,
              OJS: user,
              ror_scored_results: ror_scored_results,
              candidates: candidates.map(c => ({
                user: {
                  given_name: c.author?.given_name || "",
                  surname: c.author?.surname || "",
                  orcid: c.author?.orcid || "",
                  affiliations: c.author?.affiliations || [],
                },
                score_breakdown: c.score_breakdown?.author || {},
              })),
            };


          } catch (err) {
            console.error(`Error fetching user ${user.id}:${newUserId}`, err);
            return { ...user, ror_scored_results: [], candidates: [] };
          } finally {
            loadingScores.value[newUserId] = false;
          }
        }


        return {
          fetchUserById,
          loadingScores
        };

}