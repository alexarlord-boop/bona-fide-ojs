import * as jose from "jose";

// TODO:- better to have this jwt functionality on the backend side
export default async function generateJWT(user, secret) {
  console.log(user)
    const payload = {
      given_name: user?.OJS?.name.split(" ")[0] || user?.name.split(" ")[0]  || "",
      surname: user?.OJS?.name.split(" ").slice(1).join(" ") || user?.name.split(" ").slice(1).join(" ") || "",
      email: user?.OJS?.email || user?.email || "",
      limit_results: 5,
      uncertain_name_order: true,
      verify_email_domain: true,
      callback_url: "https://webhook.site/a994b101-17c5-411b-9f2a-fb66410e4c29"
    };


    return await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .sign(secret);
  }