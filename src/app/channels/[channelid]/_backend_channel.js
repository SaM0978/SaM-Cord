import fetchApi from "@/_api_/fetch";

export async function fetchChannel(channelId) {
  let response = await fetchApi("channel/get", "POST", { channelId }, true);
  return response;
}

export async function joinChannel(channelId) {
  let response = await fetchApi("channel/join", "POST", { channelId }, true);
  return response;
}
