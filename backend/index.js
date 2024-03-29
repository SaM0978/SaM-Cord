const express = require("express");
const cors = require("cors");

/**
 * The port number for the server to listen on.
 * @type {number}
 */
const PORT = process.env.PORT || 4000;

/**
 * Express application instance.
 * @type {express.Application}
 */
const app = express();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.raw({ type: "*/*", limit: "50mb" }));
app.use(cors());

// Routes
app.use("/auth", require("./routes/auth.js"));
app.use("/directChat", require("./routes/directChatRoutes.js"));
app.use("/channel", require("./routes/channel.js"));
app.use("/model", require("./routes/model.js"));

/**
 * Default route.
 * @name GET/
 * @function
 * @memberof module:app
 * @inner
 * @param {express.Request} req - The HTTP request.
 * @param {express.Response} res - The HTTP response.
 */
app.get("/", (req, res) => {
  res.send("Don");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}/`);
});
