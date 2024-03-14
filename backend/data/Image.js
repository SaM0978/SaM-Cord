const { Parent } = require("./Parent");

class Image extends Parent {
  constructor() {
    super({ model: "image" });
  }

  async createImage(kwargs, extra = {}) {
    const newImage = await this.prisma.image.create({
      data: {
        createdBy: { connect: { id: kwargs.userId } },
        base64: kwargs.base64,
        renderHead: kwargs.renderHead,
        ...extra,
      },
    });
    return newImage;
  }

  async getImage(userId) {
    const image = await this.prisma.image.findUnique({
      where: { createdById: userId },
    });
    return image;
  }

  async updateImage(kwargs, extra = {}) {
    const updatedImage = await this.prisma.image.update({
      where: { createdById: kwargs.userId },
      data: {
        base64: kwargs.base64,
        renderHead: kwargs.renderHead,
        ...extra,
      },
    });
    return updatedImage;
  }
}

module.exports = {
  Image,
};
