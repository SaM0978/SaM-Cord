// Imports
const express = require("express");
const {
  CreateUser,
  Login,
  Logout,
  GenerateAuthToken,
  updateUser,
  GetUser,
} = require("../data/User");
const { isUser } = require("../middlewares/authWares");
const { Image } = require("../data/Image");

// Router
const router = express.Router();

// Routes

/**
 * @route GET /api/auth/testing
 * @description Test route to check authentication
 * @access Private
 */
router.get("/testing", isUser, (req, res) => {
  // Responds with user information for testing
  res.json({
    msg: req.user,
  });
});

router.post("/get", isUser, async (req, res) => {
  try {
    let user = await GetUser("id", req.user.id);
    res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
  }
});

/**
 * @route POST /api/auth/signup
 * @description Register a new user
 * @access Public
 */
router.post("/signup", async (req, res) => {
  try {
    const { email, password, username, fullName } = req.body;

    console.log(req.body);

    // Validation: Check if all required fields are provided
    if ([email, password, username, fullName].includes(undefined)) {
      return res.status(400).json({ msg: "Not all fields have been entered." });
    }

    // Create user
    const user = await CreateUser({
      email,
      password,
      username,
      fullName,
    });

    // Respond with success message and authentication token
    res.json({ msg: "User Created", authToken: user });
  } catch (error) {
    // Handle errors
    console.log(error.message);
    res.status(401).json(error.message);
  }
});

/**
 * @route POST /api/auth/login
 * @description Log in user
 * @access Public
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Log in user
    const user = await Login({ email, password });

    // Respond with success message and user information
    res.json({ msg: "User Logged In", authToken: user });
  } catch (error) {
    // Handle errors
    res.status(401).send(error.message);
  }
});

/**
 * @route POST /api/auth/delete
 * @description Delete user account
 * @access Private
 */
router.post("/delete", isUser, async (req, res) => {
  try {
    // Logout and delete user
    await Logout(req.user.id);
    // Respond with success message
    res.json({ msg: "User Deleted" });
  } catch (error) {
    // Handle errors
    res.status(401).send(error.message);
  }
});

/**
 * @route POST /api/auth/update
 * @description Update user information
 * @access Private
 */
router.post("/update", isUser, async (req, res) => {
  try {
    // Update user
    const { username, password, email, fullname } = req.body;
    const user = await updateUser(req.user.id, {
      username,
      password,
      email,
      fullname,
    });

    const authToken = await GenerateAuthToken(user.id);

    // Respond with success message and updated user information
    res.json({ msg: "User Updated", user, authToken });
  } catch (error) {
    console.error(error.message);
    res.status(401).send(error.message);
  }
});

router.post("/profile", isUser, async (req, res) => {
  try {
    // Get user information

    let { extras, data } = req.body;

    const ImageInstance = new Image();
    const image = await ImageInstance.createImage(
      {
        userId: req.user.id,
        base64: data.split(",")[1],
        renderHead: data.split(",")[0],
      },
      extras
    );
    // Respond with user information
    res.json(image);
    // res.send("SEND");
  } catch (error) {
    console.error(error.message);
    res.status(401).send(error.message);
  }
});

router.post("/profile/get", isUser, async (req, res) => {
  try {
    // Get user information

    let userId = req.body.userId || req.user.id;

    const ImageInstance = new Image();
    const image = await ImageInstance.getImage(userId);
    // Respond with user information
    res.json(image);
  } catch (error) {
    console.error(error.message);
    res.status(401).send(error.message);
  }
});

router.post("/profile/update", isUser, async (req, res) => {
  try {
    // Get user information
    let { extras, data } = req.body;

    const ImageInstance = new Image();
    const image = await ImageInstance.updateImage(
      {
        userId: req.user.id,
        base64: data.split(",")[1],
        renderHead: data.split(",")[0],
      },
      extras
    );
    // Respond with user information
    res.json(image);
  } catch (error) {
    console.error(error.message);
    res.status(401).send(error.message);
  }
});

// Exports
module.exports = router;
