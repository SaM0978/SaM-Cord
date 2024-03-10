const ioClient = require("socket.io-client");

const socket = ioClient("http://localhost:5000");

let content = "message from user1";
let subChannelId = "295eb05e-e369-452a-9a04-943c0f2fd17b";
let userId = "5d943365-f700-4dac-9365-e0faeec98ccd";

socket.on("connect", () => {
  console.log("Connected to server");
  socket.emit("send-chat-message", content, subChannelId, userId);
  socket.emit("initial-messages", subChannelId);
});

socket.on("chat-message", (message) => {
  console.log("Received message from server:", message);
});

socket.on("initial-messages", (messages) => {
  console.log("Received initial messages from server:", messages);
});
