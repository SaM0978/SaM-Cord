const { Parent } = require("./Parent");
const prisma = require("./prismaUtils");

class DirectChat extends Parent {
  constructor({ sender, receiver, chatName } = {}) {
    super({
      model: "Directchat",
    });
    this.sender = sender;
    this.receiver = receiver;
    this.chatName = chatName;
  }

  async getChatId(chatName) {
    const chat = await prisma.directChat.findUnique({
      where: {
        chatName: chatName,
      },
    });
    return chat.id;
  }

  async DirectToMessage(messageId, senderId) {
    return await prisma.directMessage.findUnique({
      where: {
        senderId: senderId,
        id: messageId,
      },
      include: {
        Messages: true,
      },
    });
  }

  async getChat(chatName) {
    const DirectMessages = await prisma.directChat.findUnique({
      where: {
        chatName: chatName,
      },
      include: {
        messages: true,
        members: true,
        creator: true,
      },
    });

    return {
      chatName: DirectMessages.chatName,
      messages: DirectMessages.messages,
      creator: DirectMessages.creator,
    };
  }

  async getChatMessages(chatId) {
    const messages = await prisma.directMessage.findMany({
      where: {
        DirectChatId: chatId,
      },
      include: {
        sender: true,
      },
    });
    return messages;
  }

  async exists() {
    const chat = await prisma.directChat.findUnique({
      where: {
        chatName: this.chatName,
      },
    });
    return !!chat;
  }

  async createChat() {
    const chatName =
      this.chatName || `${this.sender.username} && ${this.receiver.username}`;
    const chat = await prisma.directChat.create({
      data: {
        chatName: chatName,
        creator: { connect: { id: this.sender.id } },
        recipient: { connect: { id: this.receiver.id } },
      },
      include: {
        creator: true,
        recipient: true,
      },
    });
    return chat;
  }

  async sendMessage(text, options = { chatId: null, senderId: null }) {
    let chatId = options.chatId;
    const senderId = this.sender ? this.sender.id : options.senderId;
    const message = await prisma.directMessage.create({
      data: {
        sender: { connect: { id: senderId } },
        content: text,
        DirectChat: {
          connect: {
            id: chatId,
          },
        },
      },
      include: {
        sender: true,
      },
    });
    return message;
  }

  async getChats(userId) {
    const chats = await prisma.directChat.findMany({
      where: {
        OR: [
          {
            creatorId: userId,
          },
          {
            recipientId: userId,
          },
        ],
      },
      include: {
        creator: true,
        recipient: true,
        messages: true,
      },
    });
    return chats;
  }

  async deleteChat(id) {
    const chat = await prisma.directChat.delete({
      where: {
        id: id,
      },
    });
    return "Deleted";
  }

  async updateChat(chatId, newChatName) {
    const chat = await prisma.directChat.update({
      where: {
        id: chatId,
      },
      data: {
        chatName: newChatName,
      },
    });
    return chat;
  }
}

module.exports = { DirectChat };
