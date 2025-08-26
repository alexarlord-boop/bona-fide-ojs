import { ref } from 'vue';
import generateJWT from '../utils/jwt.js';
const { useUrl } = pkp.modules.useUrl;
const { useFetch } = pkp.modules.useFetch;

import { useScoring } from "./useScoring.js";
const { fetchUserById } = useScoring();

export function useReviewers(submission) {
  const reviewers = ref([]);
  const loadingReviewers = ref(false);

    // Fetch reviewers users by ID from the submission.reviewAssignments
    const fetchReviewersBulk = async () => {
      try {
        loadingReviewers.value = true;
        console.log(submission.value.reviewAssignments);
        if (submission.value && submission.value.reviewAssignments) {
          const ids = submission.value.reviewAssignments.map(assignment => assignment.reviewerId);
          for (const id of ids) {
            // Fetch user by ID
            const { apiUrl: userApiUrl } = useUrl(`users/${id}`);
            const { data: user, fetch: fetchUser } = useFetch(userApiUrl);
            await fetchUser();
            // Add mock subscores to each reviewer
            reviewers.value.push({
              ...user.value,
              subscores: {}
            });
          }


          const reviewerIds = reviewers.value.map(reviewer => ({
              id: reviewer.id,
              name: reviewer.fullName,
              email: reviewer.email,
              orcid: reviewer.orcid || "",
              affiliations: reviewer.affiliations || [],
              score: 0,
            }));


          if (reviewerIds.length === 0) return;

          const results = await Promise.all(
            reviewerIds.map(reviewer => fetchUserById(reviewer, 'reviewer'))
          );

          reviewers.value = results;

        } else {
          console.warn('No review assignments found in submission data.');
        }
      } catch (err) {
        console.error("Error fetching reviewers:", err);
      } finally {
        loadingReviewers.value = false;
      }
    };



    return {
        reviewers,
        loadingReviewers,
        fetchReviewersBulk,
      };
}