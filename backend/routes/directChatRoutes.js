// Imports
const express = require("express");
const { isUser } = require("../middlewares/authWares");
const { DirectChat } = require("../data/DirectMessages");
const { GetUser, GetUserByUserName } = require("../data/User");
const { isMember } = require("../middlewares/directWares");

// Router
const router = express.Router();

/**
 * @route POST /api/chat/createChat
 * @description Create a new chat
 * @access Private
 */
router.post("/create", isUser, async (req, res) => {
  try {
    const { chatName, recipientuserName } = req.body;

    // Checking if chat name exists
    if (!chatName) throw new Error("Chat name is required");

    const creatorId = req.user.id;
    const creator = await GetUser("id", creatorId);
    const receiver = await GetUserByUserName(recipientuserName);

    const chatInstance = new DirectChat({
      sender: creator,
      receiver,
      chatName,
    });

    // Check if the chat already exists
    if (await chatInstance.exists()) throw new Error("Chat already exists");

    // Validate input data
    if (
      !(
        typeof chatName === "string" &&
        chatName.length > 1 &&
        typeof creatorId == "string" &&
        creatorId.length > 1
      )
    ) {
      throw new Error("Invalid input data");
    }

    // Create the chat
    const chat = await chatInstance.createChat();
    res.status(200).json(chat);
    // res.status(200).json({ message: "Chat Created" });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(401).send(error.message);
  }
});

/**
 * @route GET /api/chat/getChat
 * @description Get a chat by its name
 * @access Private
 */
router.post("/getchats", isUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const chatInstance = new DirectChat();

    // Get the chat
    const chats = await chatInstance.getChats(userId);

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error getting chat:", error);
    res.status(401).send(error.message);
  }
});

/**
 * @route GET /api/chat/getChat
 * @description Get a chat by its name
 * @access Private
 */
router.get("/get", isUser, async (req, res) => {
  try {
    const { chatName } = req.query;
    const chatInstance = new DirectChat();

    // Check if the chat exists
    if (!chatInstance.exists(chatName)) throw new Error("Chat does not exist");

    // Get the chat
    const chat = await chatInstance.getChats(chatName);

    // Check authorization
    if (chat.creatorId !== req.user.id && chat.recipientId !== req.user.id) {
      throw new Error("You are not authorized to view this chat");
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error getting chat:", error);
    res.status(401).send(error.message);
  }
});

/**
 * @route POST /api/chat/sendMessage
 * @description Send a message to a chat
 * @access Private
 */
router.post("/send", isUser, isMember, async (req, res) => {
  try {
    const { text, chatName } = req.body;
    const sender = await GetUser("id", req.user.id);
    const receiver = await GetUser("id", req.chat.recipientId);
    const chatInstance = new DirectChat({
      sender,
      receiver,
      chatName,
    });

    // Send the message
    const message = await chatInstance.sendMessage(text, {
      chatId: req.chatId,
    });
    res.status(200).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(401).send(error.message);
  }
});

/**
 * @route POST /api/chat/updateChat
 * @description Update a chat's information
 * @access Private
 */
router.post("/update", isUser, isMember, async (req, res) => {
  try {
    const { newChatName, id } = req.body;

    const chatInstance = new DirectChat();

    // Update the chat
    const updatedChat = await chatInstance.updateChat(id, newChatName);
    res.json({ message: "Chat Updated", updatedChat });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

router.post("/delete", isUser, isMember, async (req, res) => {
  try {
    const { id } = req.body;
    const chatInstance = new DirectChat();
    const chatId = id;

    // Delete the chat
    const deletedChat = await chatInstance.deleteChat(chatId);
    res.json({ message: "Chat Deleted", deletedChat });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

module.exports = router;
