export function convertRorScoreToBreakdown(score, maxOverall = 100, getScoreLabel = null) {
  const subscores = {};

  const mapping = {
    crossref_bonus: "crossref_bonus",
    dns_similarity_bonus: "dns_similarity_bonus",
    dns_verification_bonus: "dns_verification_bonus",
    domain_match: "domain_match",
    domain_of_email_in_website_subdomain: "domain_of_email_in_website_subdomain",
    domain_of_website_in_email_subdomain: "domain_of_website_in_email_subdomain",
    email_is_subdomain_of_website_domain: "email_is_subdomain_of_website_domain",
    fully_qualified_domain_name_match: "fully_qualified_domain_name_match",
    subdomain_mismatch: "subdomain_mismatch",
    total: "total",
    website_is_subdomain_of_email_domain: "website_is_subdomain_of_email_domain",
    whois_bonus: "whois_bonus",
  };

  const details = Object.keys(mapping).map((key) => ({
    label: getScoreLabel ? getScoreLabel('ror', mapping[key]) : mapping[key],
    value: score[key] || 0,
  }));

 maxOverall = details.reduce((sum, d) => sum + d.value, 0);


  if (score) {
    subscores.domain = {
      total: maxOverall,
      details: details,
    };
  }

  return subscores;
}

export function convertBaseScoreBreakdown(score, maxOverall, getScoreLabel = null) {
    const subscores = {};

     // Name (rank vs max_value)
  if (score.name) {
    subscores.name = {
      total: score.name.max_value,
      details: [
        { 
          label: getScoreLabel ? 
            (score.name.max_value === score.name.rank) ? 
              getScoreLabel('base', 'perfect_match') : 
              getScoreLabel('base', 'match') : 
            (score.name.max_value === score.name.rank) ? "Perfect Match" : "Match", 
          value: score.name.rank 
        }
      ],
    };
  }

    // Affiliations
    if (score.affiliations) {
      subscores.affiliations = {
        total: score.affiliations.cumulative_rank,
        details: [
          { label: getScoreLabel ? getScoreLabel('base', 'count') : "Count", value: score.affiliations.count },
          { label: getScoreLabel ? getScoreLabel('base', 'avg_rank') : "Avg Rank", value: score.affiliations.avg_rank_per_affiliation },
        ],
      };
    }

    // Emails
    if (score.emails) {
      subscores.emails = {
        total: score.emails.cumulative_rank || score.emails.count,
        details: [
          { label: getScoreLabel ? getScoreLabel('base', 'count') : "Count", value: score.emails.count },
          { label: getScoreLabel ? getScoreLabel('base', 'cumulative') : "Cumulative", value: score.emails.cumulative_rank },
          { label: getScoreLabel ? getScoreLabel('base', 'perfect_match') : "Perfect Match", value: score.emails.perfect_match },
        ],
      };
    }

    // Attributes overall
    if (score.attributes_with_perfect_match !== undefined) {
      subscores.attributes = {
        total: score.attributes_with_perfect_match,
        details: [
          { label: getScoreLabel ? getScoreLabel('base', 'attributes_w_perfect_match') : "Attributes w/ perfect match", value: score.attributes_with_perfect_match },
        ],
      };
    }

    // Global score
    if (score.cumulative_rank !== undefined) {
      subscores.overall = {
        total: maxOverall,
        details: [
          { label: getScoreLabel ? getScoreLabel('base', 'cumulative_rank') : "Cumulative Rank", value: score.cumulative_rank },
          { label: getScoreLabel ? getScoreLabel('base', 'difference') : "Difference", value: Math.round(maxOverall - score.cumulative_rank) },
        ],
      };
    }

    return subscores;
  }
