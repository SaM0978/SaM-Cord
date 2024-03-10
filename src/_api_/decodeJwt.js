export default function decodeJwt(jwtString) {
  // Split the JWT string into its three parts: header, payload, and signature
  const [headerEncoded, payloadEncoded, signature] = jwtString.split(".");

  // Decode the payload part (second part)
  const payloadDecoded = Buffer.from(payloadEncoded, "base64").toString(
    "utf-8"
  );

  // Parse the decoded payload string into a JavaScript object
  const payloadObject = JSON.parse(payloadDecoded);

  return payloadObject;
}
