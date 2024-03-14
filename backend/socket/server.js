const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { ChannelManager } = require("../data/Channel");
const { DirectChat } = require("../data/DirectMessages");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  // Initial subchannel messages
  socket.on("initial-subchannel-messages", async (subChannelId) => {
    try {
      const channelInstance = new ChannelManager();
      const messages = await channelInstance.getMessages(subChannelId);
      socket.emit("initial-subchannel-messages", messages);
    } catch (error) {
      console.error("Error fetching initial subchannel messages:", error);
      socket.emit("error", "Failed to fetch initial subchannel messages");
    }
  });

  // Send subchannel message
  socket.on(
    "send-subchannel-message",
    async (content, subChannelId, userId) => {
      try {
        const channelInstance = new ChannelManager();
        const subChannel = await channelInstance.getSubChannel(subChannelId);
        const message = await subChannel.sendMessage(content, userId);
        io.emit("subchannel-chat-message", message); // Broadcast to all connected clients
      } catch (error) {
        console.error("Error sending subchannel message:", error);
        socket.emit("error", "Failed to send subchannel message");
      }
    }
  );

  // Initial direct messages
  socket.on("initial-direct-messages", async (chatId) => {
    try {
      if (!chatId) return;
      const chatInstance = new DirectChat();
      const messages = await chatInstance.getChatMessages(chatId);
      socket.emit("initial-direct-messages", messages);
    } catch (error) {
      console.error("Error fetching initial direct messages:", error);
      socket.emit("error", "Failed to fetch initial direct messages");
    }
  });

  // Send direct message
  socket.on("send-direct-message", async (content, chatId, userId) => {
    try {
      const chatInstance = new DirectChat();
      const message = await chatInstance.sendMessage(content, {
        chatId,
        senderId: userId,
      });
      io.emit("direct-chat-message", message); // Broadcast to all connected clients
    } catch (error) {
      console.error("Error sending direct message:", error);
      socket.emit("error", "Failed to send direct message");
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
