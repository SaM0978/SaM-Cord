// Imports
const prisma = require("../data/prismaUtils");

// Functions

async function isMember(req, res, next) {
  try {
    let whereCode = {};
    if (req.body.id) whereCode = { id: req.body.id };
    if (req.body.chatName) whereCode = { chatName: req.body.chatName };
    console.log("whereCode:", whereCode);
    const chat = await prisma.directChat.findUnique({
      where: whereCode,
    });

    if (chat == null) throw new Error("Chat Does Not Exist");

    if (chat.creatorId !== req.user.id && chat.recipientId !== req.user.id)
      throw new Error("You Are Not A Member Of This Chat");

    req.chat = chat;
    // console.log("receiverId ID:", req.receiverId);
    next();
  } catch (error) {
    console.error("Error Checking Chat Membership:", error);
    prisma.$disconnect();
    return res.status(401).send(error.message);
  }
}

module.exports = { isMember };
