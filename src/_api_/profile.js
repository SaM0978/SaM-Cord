import fetchApi from "./fetch";

async function getProfile(userId) {
  try {
    const response = await fetchApi(
      "auth/profile/get",
      "POST",
      { userId },
      true
    );
    const url = `${response.renderHead},${Buffer.from(response.base64).toString(
      "base64"
    )}`;
    return url;
  } catch (err) {
    return false;
  }
}

export default getProfile;
