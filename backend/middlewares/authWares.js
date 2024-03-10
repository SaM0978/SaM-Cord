const jwt = require("jsonwebtoken");

async function isUser(req, res, next, kwargs = {}) {
  try {
    const token = req.header("auth-token");
    if (!token)
      return res
        .status(401)
        .json({ msg: "No authentication token, authorization denied." });
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified)
      return res
        .status(401)
        .json({ msg: "Token verification failed, authorization denied." });
    req.user = verified;
    next();
  } catch (error) {
    return res
      .status(401)
      .send(error.message == "jwt malformed" ? "Invalid token" : error.message);
  }
}

module.exports = { isUser };
