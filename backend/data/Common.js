// Imports
const fs = require("fs");
const path = require("path");

// Variables

// Functions
function SecretGen() {
  let secretMessages = jsonData("data").Secrets;
  return secretMessages[Math.floor(Math.random() * secretMessages.length)];
}

function jsonData(file = "data") {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        __dirname,
        `jsons/${file.includes(".json") ? file.split(".")[0] : file}.json`
      ),
      "utf8"
    )
  );
}

module.exports = { SecretGen, jsonData };
