const { GetUser } = require("./User");
const { Parent } = require("./Parent");
const prisma = require("./prismaUtils");

class Channel {
  constructor({
    id,
    channelName,
    category,
    isPublic,
    description,
    createdById,
    whiteList,
    members,
  }) {
    this.channelId = id;
    this.channelName = channelName;
    this.category = category;
    this.isPublic = isPublic;
    this.description = description;
    this.createdById = createdById;
    this.whiteList = whiteList;
    this.members = members;
  }

  async getSubChannels() {
    return await prisma.subChannel.findMany({
      where: { parentChannelId: this.channelId },
      include: { messages: true },
    });
  }

  async deleteChannel() {
    await prisma.channel.delete({
      where: { id: this.channelId },
    });
    return "Channel Deleted";
  }

  async createSubChannel({ subChannelName, description, type }) {
    const newSubChannel = await prisma.subChannel.create({
      data: {
        name: subChannelName,
        description: description,
        parentChannel: { connect: { id: this.channelId } },
        type: type,
      },
    });
    return newSubChannel;
  }

  async updateChannel(kwargs) {
    const updatedChannel = await prisma.channel.update({
      where: { id: this.channelId },
      data: kwargs,
    });
    return new Channel(updatedChannel);
  }

  async deleteSubChannel(subChannelId) {
    await prisma.subChannel.delete({
      where: { id: subChannelId },
    });
    return "Sub Channel Deleted";
  }

  async updateSubChannel(subChannelId, kwargs, t = false) {
    const SubChannelFields = ["name", "description", "type"];

    // Filter out invalid fields
    const validFields = {};
    SubChannelFields.forEach((field) => {
      if (kwargs[field]) {
        validFields[field] = kwargs[field];
      }
    });

    const updatedSubChannel = await prisma.subChannel.update({
      where: { id: subChannelId },
      data: t ? kwargs["SECRET"] : validFields,
    });
    return updatedSubChannel;
  }

  async createMessage(message_content, subChannelId, userId) {
    const newMessage = await prisma.message.create({
      data: {
        content: message_content,
        subChannel: { connect: { id: subChannelId } },
        writtenBy: { connect: { id: userId } },
      },
    });
    return newMessage;
  }
}

class SubChannel extends Parent {
  constructor({ id }) {
    super({ model: "subChannel" });
    this.subChannelId = id;
  }

  async sendMessage(content, userId) {
    const newMessage = await prisma.message.create({
      data: {
        content: content,
        subChannel: { connect: { id: this.subChannelId } },
        writtenBy: { connect: { id: userId } },
      },
    });
    return newMessage;
  }
}

class ChannelManager extends Parent {
  constructor() {
    super({ model: "channel" });
  }

  async;

  async getMessages(subChannelId) {
    const messages = await prisma.message.findMany({
      where: { subChannelId: subChannelId },
      include: { writtenBy: true },
    });
    return messages;
  }

  async getPublicChannel() {
    const publicChannels = await prisma.channel.findMany({
      where: { isPublic: true },
      include: {
        createdBy: true,
        subChannels: true,
      },
    });

    if (!publicChannels) {
      throw new Error("No public channels found");
    } else {
      return publicChannels;
    }
  }

  async createChannel({
    channelName,
    category,
    isPublic,
    description,
    createdById,
  }) {
    let user = await GetUser("id", createdById);
    if (typeof user == "string") {
      throw new Error("User Not Found");
    }
    let username = user.username;

    const newChannel = await prisma.channel.create({
      data: {
        channelName: channelName,
        category: category,
        isPublic: isPublic,
        description: description,
        members: { connect: { id: createdById } },
        createdBy: { connect: { id: createdById } },
        roles: {
          create: {
            role: "Admin",
            username: username,
            user: {
              connect: { id: createdById },
            },
          },
        },
      },
      include: {
        createdBy: true,
        subChannels: true,
        members: true,
      },
    });

    let finalChannel = new Channel(newChannel);
    return finalChannel;
  }

  async getJoinedChannels(userId) {
    const user = await GetUser("id", userId);
    if (typeof user == "string") {
      throw new Error("User Not Found");
    }

    const channels = await prisma.channel.findMany({
      where: { members: { some: { id: userId } } },
      include: {
        createdBy: true,
        subChannels: true,
        members: true,
      },
    });

    return channels;
  }

  async getChannel(id, doOneThing = false) {
    const channel = await prisma.channel.findUnique({
      where: { id: id },
      include: {
        createdBy: true,
        subChannels: {
          include: {
            messages: {
              include: {
                writtenBy: true,
              },
            },
          },
        },
        members: true,
      },
    });

    if (channel) {
      return doOneThing ? channel : new Channel(channel);
    }
  }

  async getSubChannel(id) {
    const subChannel = await prisma.subChannel.findUnique({
      where: { id: id },
    });
    return new SubChannel({ id: subChannel.id });
  }
}

module.exports = { ChannelManager };
