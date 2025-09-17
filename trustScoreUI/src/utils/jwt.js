import * as jose from "jose";

// TODO:- better to have this jwt functionality on the backend side
export default async function generateJWT(user, secret) {
  console.log(user)

  const nameStr = user?.ojsName || user?.name || "";
  const [given_name, ...rest] = nameStr.split(" ");
  const surname = rest.join(" ");

  const payload = {
    given_name: given_name || "",
    surname: surname || "",
    email: user?.ojsEmail || user?.email || "",
    limit_results: 5,
    uncertain_name_order: true,
    verify_email_domain: true,
    callback_url: "https://webhook.site/a994b101-17c5-411b-9f2a-fb66410e4c29"
  };


    return await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .sign(secret);
  }