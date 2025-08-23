import * as jose from "jose";
export default async function generateJWT(author, secret) {
    const payload = {
      given_name: author.name.split(" ")[0] || "",
      surname: author.name.split(" ").slice(1).join(" ") || "",
      email: author.email,
      limit_results: 5,
      uncertain_name_order: true,
      verify_email_domain: true,
      callback_url: "https://webhook.site/a994b101-17c5-411b-9f2a-fb66410e4c29"
    };

    return await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .sign(secret);
  }