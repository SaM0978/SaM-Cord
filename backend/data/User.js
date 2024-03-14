// Imports
const prisma = require("./prismaUtils");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const process = require("process");
const { Image } = require("./Image");
const { create } = require("yallist");
const jwtSecret = process.env.JWT_SECRET || "secret";

// Functions
async function CreateUser(userData) {
  //  Destructure the userData object
  let { username, password, fullName, email } = userData;

  let UserExists = await GetUser("email", email);

  //  Checking If User Exists
  if (UserExists !== null) throw new Error("User Already Exists");

  //   Encrypting The Password
  password = bcrypt.hashSync(password, 10);

  const ImageInstance = new Image();

  //  Creating User
  const user = await prisma.user.create({
    data: {
      username,
      fullName,
      password,
      email,
    },
  });

  await ImageInstance.createImage(
    {
      base64: "ZGVmYXVsdA==",
      userId: user.id,
      renderHead: "default",
    },
    { filename: "default", imageType: "image/png" }
  );

  // Signing User Off
  const authToken = jwt.sign(user, jwtSecret);

  return authToken;
}

async function GetUser(field, value, throwErr = false) {
  // Set default value of throwErr to false
  const where = {
    [field]: value,
  };
  const user = await prisma.user.findUnique({
    where,
    include: {
      profilePicture: true,
    },
  });
  return user;
}

async function Logout(userId) {
  await GetUser("id", userId);
  await prisma.user.delete({
    where: { id: userId },
  });
}

async function GetUserByUserName(username) {
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  return user;
}

async function Login(userData) {
  const { email, password, samadisop } = userData;

  let User = await GetUser("email", email);

  if (User === null) throw new Error("User Does Not Exist");

  let passwordComparison = bcrypt.compareSync(password, User.password);

  if (passwordComparison) {
    return jwt.sign(User, jwtSecret);
  } else {
    throw new Error("Incorrect Password");
  }
}

async function GenerateAuthToken(userId) {
  const user = await GetUser("id", userId);
  const authToken = jwt.sign(user, jwtSecret);
  return authToken;
}

async function UpdatingUser(userId, fieldToUpdate, updatingValue) {
  await GetUser("id", userId);

  let value = updatingValue;

  if (fieldToUpdate === "password") {
    value = bcrypt.hashSync(value, 10);
  }
  let updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      [fieldToUpdate]: value,
    },
    include: {},
  });
  return updatedUser;
}

async function updateUser(userId, dataToBeUpdated) {
  dataThing = {};
  ["username", "email", "password", "fullname"].map((element) => {
    if (dataToBeUpdated[element]) dataThing[element] = dataToBeUpdated[element];
  });

  const user = await prisma.user.update({
    where: { id: userId },
    data: dataThing,
  });
  return user;
}

function tokenToUser(token) {
  return jwt.verify(token, jwtSecret);
}

module.exports = {
  CreateUser,
  GetUser,
  Login,
  Logout,
  UpdatingUser,
  tokenToUser,
  updateUser,
  GetUserByUserName,
  GenerateAuthToken,
};
