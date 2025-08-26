import { ref } from 'vue';
import generateJWT from '../utils/jwt.js';
const { useUrl } = pkp.modules.useUrl;
const { useFetch } = pkp.modules.useFetch;

import { useScoring } from "./useScoring.js";
const { fetchUserById } = useScoring();


export function useAuthors(submissionId) {
  const authors = ref([]);
  const loadingAuthors = ref(false);

  async function fetchAuthorsBulk() {
    console.log("Fetching array of users");

    // Fetch submission publication data from the API
    const { apiUrl: submissionPublicationApiUrl } = useUrl(`submissions/${submissionId}/publications/${submissionId}`);
    const { data: publication, fetch: fetchSubmissionPublication } = useFetch(submissionPublicationApiUrl);

    loadingAuthors.value = true;
    try {

          await fetchSubmissionPublication();
          const authorIds = (publication.value?.authors || []).map(author => ({
            id: author.id,
            name: author.fullName,
            email: author.email,
            orcid: author.orcid || "",
            affiliations: author.affiliations || [],
            score: 0,
          }));

          if (authorIds.length === 0) return;

          const results = await Promise.all(
            authorIds.map(author => fetchUserById(author, 'author'))
          );

          authors.value = results;
        } catch (err) {
          console.error("Error fetching authors:", err);
    } finally {
      loadingAuthors.value = false;
    }
  }

  return {
    authors,
    loadingAuthors,
    fetchAuthorsBulk
  };
}
