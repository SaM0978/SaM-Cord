// Imports
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { SecretGen } = require("./Common.js").default;
const { Parent } = require("./Parent");
const prisma = require("./prismaUtils.js");

// Functions

class Message extends Parent {
  constructor({ model, prisma }) {
    super({ model, prisma });
  }
  async GetMessage(field, value) {
    const includes = ["writtenBy", "SubChannel"];
    const message = await prisma.message.findUnique({
      where: {
        [field]: value,
      },
      include: {
        [includes[0]]: includes.includes(includes[0]),
        [includes[1]]: includes.includes(includes[1]),
      },
    });
    return message ? message : "Message Not Found";
  }

  async WriteMessage({ message, writtenById, enc = false }) {
    const newMessage = await prisma.message.create({
      data: {
        content: message,
        writtenBy: { connect: { id: writtenById } },
        SubChannel: subChannel
          ? { connect: { id: subChannel.id } }
          : Error("SubChannel not found"),
        messageSecret: enc ? SecretGen() : null, // Store the secret only if encryption is enabled
      },
      include: {
        writtenBy: true,
        SubChannel: true,
      },
    });

    if (enc) {
      // Encrypt the message
      const encryptedMessage = bcrypt.hashSync(newMessage.message, 10);

      // Sign the encrypted message with the generated secret
      const token = jwt.sign(
        { message: encryptedMessage },
        newMessage.messageSecret
      );

      // Return the new message along with the token
      return { newMessage, token };
    }

    // Return the new message without encryption
    return newMessage;
  }

  async ReadMessage(token) {
    // Decode the token to get the message and the secret
    const decodedToken = jwt.decode(token);
    const encryptedMessage = decodedToken.message;
    const messageSecret = decodedToken.secret; // Assuming secret is stored in the token

    // Verify the token to ensure its authenticity
    const decoded = jwt.verify(token, messageSecret);

    // If verification fails, throw an error or handle accordingly
    if (!decoded) {
      throw new Error("Token verification failed");
    }

    // Decrypt the message using the secret
    const decryptedMessage = bcrypt.compareSync(
      decoded.message,
      encryptedMessage
    );

    // Return the decrypted message
    return decryptedMessage;
  }

  async TextToMessage(text, senderId) {
    return await prisma.message.create({
      data: {
        content: text,
        writtenBy: { connect: { id: senderId } },
      },
      include: {
        writtenBy: true,
        content: true,
      },
    });
  }
}

module.exports = {
  Message,
};
