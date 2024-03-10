export default async function fetchApi(
  url,
  method,
  data,
  isToken = false,
  contentType = "application/json"
) {
  const headers = {
    Accept: "*/*",
    "Content-Type": contentType, // Always set Content-Type header
  };
  const host = "http://localhost:4000/";

  url = host + url;

  if (isToken) {
    const authToken = localStorage.getItem("auth-token");
    if (!authToken) return;
    headers["auth-token"] = authToken;
  }

  let finalUrl = url;
  if (method.toLowerCase() === "get" && data) {
    const queryString = Object.keys(data)
      .map(
        (key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`
      )
      .join("&");
    finalUrl += `?${queryString}`;
  }

  const requestOptions = {
    method: method.toUpperCase(),
    headers: headers,
    body:
      method.toUpperCase() === "POST" && data != null
        ? JSON.stringify(data)
        : undefined,
  };

  let request = await fetch(finalUrl, requestOptions);

  if (request.ok === false) throw new Error("Request failed");

  let response = await request.json();

  return response;
}
