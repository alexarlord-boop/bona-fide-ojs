import { ref } from 'vue';
import generateJWT from '../utils/jwt.js';
const { useUrl } = pkp.modules.useUrl;
const { useFetch } = pkp.modules.useFetch;

import { useScoring } from "./useScoring.js";

export function useReviewers(submission, getTranslation = null) {
  const reviewers = ref([]);
  const loadingReviewers = ref(false);
  
  const { fetchUserById } = useScoring(getTranslation);

    // Fetch reviewers users by ID from the submission.reviewAssignments
    const fetchReviewersBulk = async () => {
      console.log('Submission in fetchReviewersBulk: ', submission);
      if (!submission.value || !submission.value.reviewAssignments) {
        console.warn("fetchReviewersBulk: submission or reviewAssignments not ready");
        return [];
      }

      try {
        loadingReviewers.value = true;
        const rAss = submission.value.reviewAssignments || submission.reviewAssignments;
        console.log(rAss);
        if (submission.value && rAss) {
          const ids = rAss.map(assignment => assignment.reviewerId);
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