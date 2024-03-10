const ioClient = require("socket.io-client");

const socket = ioClient("http://localhost:5000");

const content = "message from user1";
const chatId = "1f91aa30-1b09-44ac-9f23-a50d02acfb0f";
const userId = "848e5c07-b676-45f4-be0f-6a9f40ff8a9f";

socket.on("connect", () => {
  console.log("Connected to server");
  // Emit initial-direct-messages event to fetch initial messages
  socket.emit("initial-direct-messages", chatId, (error) => {
    if (error) {
      console.error("Error fetching initial messages:", error);
    } else {
      console.log("Initial messages fetched successfully");
    }
  });

  // Emit send-direct-message event to send a direct message
  socket.emit("send-direct-message", content, chatId, userId, (error) => {
    if (error) {
      console.error("Error sending message:", error);
    } else {
      console.log("Message sent successfully");
    }
  });
});

// Listen for direct-chat-message event to receive new messages
socket.on("direct-chat-message", (message) => {
  console.log("Received message from server:", message);
});

// Listen for initial-direct-messages event to receive initial messages
socket.on("initial-direct-messages", (messages) => {
  console.log("Received initial messages from server:", messages);
});
