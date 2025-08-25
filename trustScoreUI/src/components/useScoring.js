
import { ref } from 'vue';
import generateJWT from '../utils/jwt.js';

const secret = new TextEncoder().encode("a-string-secret-at-least-256-bits-long"); // must be at least 256 bits

export function useScoring() {
  const loadingScores = ref(false);

    async function fetchUserById(user) {
        console.log("Fetching single user: ", user);
          try {
            loadingScores.value = true;
            const serviceUrl = "http://localhost:5000/verify-eduperson";
            const jwt = await generateJWT(user, secret);

            // 1. Start job
            const response = await fetch(serviceUrl, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwt}`,
              },
            });

            if (!response.ok) throw new Error(`Backend error: ${response.statusText}`);
            const { job_id } = await response.json();

            // 2. Poll
            const pollUrl = `http://localhost:5000/status/${job_id}`;
            let result = null;

            for (let attempts = 0; attempts < 20; attempts++) {
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

              await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // 3. Parse result
            const candidates = result?.researcher_info?.candidates || [];
            return {
              id: user.id,
              OJS: user,
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
            console.error(`Error fetching user ${user.id}:`, err);
            return { id: user.id, OJS: user, candidates: [] };
          } finally {
            loadingScores.value = false;
          }
        }


        return {
          fetchUserById,
          loadingScores
        };

}