let tokenCheck;
export default tokenCheck = (router, url) =>
  localStorage.getItem("auth-token") ? null : router.push(url);
