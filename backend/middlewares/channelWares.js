// Imports
const prisma = require("../data/prismaUtils");

// Functions
async function isMember(req, res, next) {
  try {
    const chat = await prisma.channel.findUnique({
      where: {
        channelName: req.body.channelName,
      },
    });

    if (chat == null) throw new Error("Chat Does Not Exist");

    if (chat.creatorId !== req.user.id && chat.recipientId !== req.user.id)
      throw new Error("You Are Not A Member Of This Chat");

    req.chat = chat;
    next();
  } catch (error) {
    console.error("Error Checking Chat Membership:", error);
    prisma.$disconnect();
    return res.status(401).send(error.message);
  }
}

module.exports = { isMember };
