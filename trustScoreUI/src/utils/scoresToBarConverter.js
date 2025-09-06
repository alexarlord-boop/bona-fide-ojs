export function convertRorScoreToBreakdown(score, maxOverall = 100) {
  const subscores = {};

  const mapping = {
    crossref_bonus: "Crossref Bonus",
    dns_similarity_bonus: "DNS Similarity",
    dns_verification_bonus: "DNS Verification",
    domain_match: "Domain Match",
    domain_of_email_in_website_subdomain: "Email in Website Subdomain",
    domain_of_website_in_email_subdomain: "Website in Email Subdomain",
    email_is_subdomain_of_website_domain: "Email is Subdomain of Website",
    fully_qualified_domain_name_match: "FQDN Match",
    subdomain_mismatch: "Subdomain Mismatch",
    total: "Total Score",
    website_is_subdomain_of_email_domain: "Website is Subdomain of Email",
    whois_bonus: "WHOIS Bonus",
  };

  const details = Object.keys(mapping).map((key) => ({
    label: mapping[key],
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

export function convertBaseScoreBreakdown(score, maxOverall) {
    const subscores = {};

     // Name (rank vs max_value)
  if (score.name) {
    subscores.name = {
      total: score.name.max_value,
      details: [
        { label: (score.name.max_value === score.name.rank) ? "Perfect Match" : "Match" , value: score.name.rank }
      ],
    };
  }

    // Affiliations
    if (score.affiliations) {
      subscores.affiliations = {
        total: score.affiliations.cumulative_rank,
        details: [
          { label: "Count", value: score.affiliations.count },
          { label: "Avg Rank", value: score.affiliations.avg_rank_per_affiliation },
        ],
      };
    }

    // Emails
    if (score.emails) {
      subscores.emails = {
        total: score.emails.cumulative_rank || score.emails.count,
        details: [
          { label: "Count", value: score.emails.count },
          { label: "Cumulative", value: score.emails.cumulative_rank },
          { label: "Perfect Match", value: score.emails.perfect_match },
        ],
      };
    }

    // Attributes overall
    if (score.attributes_with_perfect_match !== undefined) {
      subscores.attributes = {
        total: score.attributes_with_perfect_match,
        details: [
          { label: "Attributes w/ perfect match", value: score.attributes_with_perfect_match },
        ],
      };
    }

    // Global score
    if (score.cumulative_rank !== undefined) {
      subscores.overall = {
        total: maxOverall,
        details: [
          { label: "Cumulative Rank", value: score.cumulative_rank },
          { label: "Difference", value: Math.round(maxOverall - score.cumulative_rank) },
        ],
      };
    }

    return subscores;
  }
