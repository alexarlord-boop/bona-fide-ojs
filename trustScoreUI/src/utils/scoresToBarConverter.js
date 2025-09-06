function convertRorScoreToBreakdown(score, maxOverall = 100) {
  console.log('convertRorScoreToBreakdown', score);
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
  console.log(subscores);

  return subscores;
}

export default convertRorScoreToBreakdown;