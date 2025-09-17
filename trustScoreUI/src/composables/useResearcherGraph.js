import {ref} from 'vue';
import {useStorage} from "../composables/useStorage.js";
import {generateResearcherGraphJWT} from '../utils/researcherGraphJWT.js';

const secret = new TextEncoder().encode("a-string-secret-at-least-256-bits-long");

export function useResearcherGraph() {
    const loadingGraph = ref(false);
    const {getStorage} = useStorage("local");

    const backendBaseUrl = ref('http://localhost:5000');

    async function fetchResearcherGraph(researcher) {
        try {
            loadingGraph.value = true;

            const jwt = await generateResearcherGraphJWT(researcher, secret, backendBaseUrl.value);

            const apiUrl = `${backendBaseUrl.value}/researcher-relationship-graph`;

            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${jwt}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();
            console.log("Job started:", JSON.stringify(data, null, 2));

            const jobId = data[0].job_id;

            const result = await pollJobStatus(jobId, jwt);

            return result;

        } catch (error) {
            console.error("Request failed:", error);
            throw error;
        } finally {
            loadingGraph.value = false;
        }
    }

    async function pollJobStatus(jobId, jwt) {
        const statusUrl = `${backendBaseUrl.value}/status/${jobId}`;

        console.log(`\nChecking status for job: ${jobId}`);

        while (true) {
            const res = await fetch(statusUrl);

            const jobData = await res.json();

            console.log("Current status:", jobData.status);

            if (jobData.status === "FINISHED_SUCCESS") {
                console.log("\nFinal Result:");
                console.log(JSON.stringify(jobData.result, null, 2));
                return jobData.result;
            } else if (jobData.status === "FINISHED_ERROR") {
                console.error("\nJob failed!");
                console.error("Error message:", jobData.error_message);
                console.error("Full error response:", jobData); // Add this line
                const errorMsg = jobData.error_message || "Backend job failed with unknown error";
                throw new Error(errorMsg);
            }

            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }

    return {
        fetchResearcherGraph,
        loadingGraph
    };
}