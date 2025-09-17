import * as jose from "jose";

export async function generateResearcherGraphJWT(researcher, secret, backendBaseUrl = "http://localhost:5000") {
    let researcherName;
    if (typeof researcher === 'object' && researcher !== null) {
        researcherName = researcher.ojsName || researcher.full_name || researcher.name || "";
    } else {
        researcherName = String(researcher || "");
    }

    const payload = {
        researchers: [
            {
                full_name: researcherName.trim(),
                callback_url: `${backendBaseUrl}/status/callback`
            }
        ]
    };

    return await new jose.SignJWT(payload)
        .setProtectedHeader({alg: "HS256", typ: "JWT"})
        .setExpirationTime('1h')
        .sign(secret);
}