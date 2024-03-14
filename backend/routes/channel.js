// Imports
const express = require("express");
const { ChannelManager } = require("../data/Channel");
const { isUser } = require("../middlewares/authWares");
const { Message } = require("../data/Message");

// Router
const router = express.Router();

// Routes
router.post("/create", isUser, async (req, res) => {
  try {
    let { channelName, category, isPublic, description } = req.body;

    if ([channelName, category, isPublic, description].includes(undefined))
      throw new Error("Invalid Input Data");

    isPublic == "true" ? (isPublic = true) : (isPublic = false);

    const channelInstance = new ChannelManager();
    const createdById = req.user.id;

    if (channelInstance.instanceExists("channelName", channelName) == true)
      throw new Error("Channel Already Exists");

    const channel = await channelInstance.createChannel({
      channelName,
      category,
      isPublic,
      description,
      createdById,
    });

    res.status(200).json(channel);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

router.post("/getpublic", isUser, async (req, res) => {
  try {
    const channelInstance = new ChannelManager();
    const channels = await channelInstance.getPublicChannel();

    res.status(200).json(channels);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

router.post("/get", isUser, async (req, res) => {
  try {
    const { channelId } = req.body;
    if (channelId === undefined) throw new Error("Invalid Input Data");

    const channelInstance = new ChannelManager();
    const channel = await channelInstance.getChannel(channelId, true);

    if (
      channel.isPublic === false &&
      channel.createdById !== req.user.id &&
      !channel.members.includes(req.user.id)
    )
      throw new Error("Unauthorized Access To Private Channel");

    res.status(200).json(channel);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

router.post("/joined", isUser, async (req, res) => {
  try {
    const channelInstance = new ChannelManager();
    const channels = await channelInstance.getJoinedChannels(req.user.id);
    res.status(200).json(channels);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

router.post("/delete", isUser, async (req, res) => {
  try {
    const { id } = req.body;
    const channelId = id;
    if (channelId === undefined) throw new Error("Invalid Input Data");

    const channelInstance = new ChannelManager();
    const channel = await channelInstance.getChannel(channelId);

    if (channel.createdById !== req.user.id)
      throw new Error("Unauthorized Access To Delete Channel");

    let channelDeletion = await channel.deleteChannel();

    res.status(200).send(channelDeletion);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

router.post("/update", isUser, async (req, res) => {
  try {
    const { channelId } = req.body;
    if (channelId === undefined) throw new Error("Invalid Input Data");

    const channelInstance = new ChannelManager();
    const channel = await channelInstance.getChannel(channelId);

    if (channel.createdById !== req.user.id)
      throw new Error("Unauthorized Access To Update Channel");

    // Create an object to store updated values
    const updatedValues = {};

    ["channelName", "category", "isPublic", "description"].forEach((item) => {
      if (channel[item] !== req.body[item]) {
        updatedValues[item] = req.body[item];
      }
    });

    // Update only if there are changes
    if (Object.keys(updatedValues).length > 0) {
      const updatedChannel = await channel.updateChannel(updatedValues);
      res.status(200).json(updatedChannel);
    } else {
      res.status(200).json(channel); // If no changes, return the existing channel
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

router.post("/join", isUser, async (req, res) => {
  try {
    const { channelId } = req.body;
    if (channelId === undefined) throw new Error("Invalid Input Data");

    const channelInstance = new ChannelManager();
    const channel = await channelInstance.getChannel(channelId, false);

    const membersId = channel.members.map((member) => member.id);

    if (membersId.includes(req.user.id)) throw new Error("Already Joined");

    await channel.updateChannel({ members: { connect: { id: req.user.id } } });

    res.status(200).json("Joined");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

router.post("/leave", isUser, async (req, res) => {
  try {
    const { channelId } = req.body;
    if (channelId === undefined) throw new Error("Invalid Input Data");

    const channelInstance = new ChannelManager();
    const channel = await channelInstance.getChannel(channelId, true);

    if (channel.isPublic === false && channel.members.includes(req.user.id)) {
      channel.members = channel.members.filter(
        (member) => member !== req.user.id
      );
      await channel.save();
    }

    res.status(200).json("Left");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

router.post("/sub/create", isUser, async (req, res) => {
  try {
    let { channelId, subChannelName, description, type } = req.body;
    type = type.toLowerCase();
    if (
      channelId === undefined ||
      subChannelName === undefined ||
      description === undefined
    )
      throw new Error("Invalid Input Data");

    const channelInstance = new ChannelManager();
    const channel = await channelInstance.getChannel(channelId);

    if (channel.createdById !== req.user.id)
      throw new Error("Unauthorized Access To Create Sub Channel");

    const subChannel = await channel.createSubChannel({
      subChannelName,
      description,
      type,
    });

    res.status(200).json(subChannel);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

router.post("/sub/delete", isUser, async (req, res) => {
  try {
    const { subChannelId, channelId } = req.body;
    if (subChannelId === undefined) throw new Error("Invalid Input Data");

    const channelInstance = new ChannelManager();
    const channel = await channelInstance.getChannel(channelId);

    if (channel.createdById !== req.user.id)
      throw new Error("Unauthorized Access To Create Sub Channel");

    const subChannel = await channel.deleteSubChannel(subChannelId);
    res.status(200).json(subChannel);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

router.post("/sub/get", isUser, async (req, res) => {
  try {
    const { channelId } = req.body;
    if (channelId === undefined) throw new Error("Invalid Input Data");

    const channelInstance = new ChannelManager();
    const subChannels = await channelInstance.getSubChannels(channelId);

    res.status(200).json(subChannels);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

router.post("/sub/update", isUser, async (req, res) => {
  try {
    let { subChannelId, channelId, name, description, type } = req.body;
    if (subChannelId === undefined) throw new Error("Invalid Input Data");

    type = type.toLowerCase();

    const channelInstance = new ChannelManager();
    const channel = await channelInstance.getChannel(channelId);

    if (channel.createdById !== req.user.id)
      throw new Error("Unauthorized Access To Create Sub Channel");

    const subChannel = await channel.updateSubChannel(subChannelId, {
      name,
      description,
      type,
    });

    res.status(200).json(subChannel);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

router.post("/sub/message", isUser, async (req, res) => {
  try {
    const { subChannelId, content, channelId } = req.body;
    if (
      subChannelId === undefined ||
      content === undefined ||
      channelId === undefined
    )
      throw new Error("Invalid Input Data");

    const channelInstance = new ChannelManager();
    const channel = await channelInstance.getChannel(channelId);
    const newMessage = await channel.createMessage(
      content,
      subChannelId,
      req.user.id
    );

    res.status(200).json(newMessage);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

router.post("/sub/message/update", isUser, async (req, res) => {
  try {
    const { messageId, content } = req.body;
    if (messageId === undefined || content === undefined)
      throw new Error("Invalid Input Data");
    const messageInstance = new Message();
    let messagenew = await messageInstance.UpdateMessage(messageId, content);
    console.log(messagenew);
    res.status(200).json({ msg: "Message Updated" });
  } catch (error) {
    console.error(error);
  }
});

router.post("/sub/message/delete", isUser, async (req, res) => {
  try {
    const { messageId } = req.body;
    if (messageId === undefined) throw new Error("Invalid Input Data");
    const messageInstance = new Message();
    let messagenew = await messageInstance.delete(messageId);
    console.log(messagenew, "DONe");
    res.status(200).json({ msg: "Message Deleted" });
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
