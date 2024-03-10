const router = require("express").Router();
const prisma = require("../data/prismaUtils");
const fs = require("fs");

/**
 * POST /auth/unique
 * Endpoint to retrieve unique fields of a model.
 * @name POST/auth/unique
 * @function
 * @memberof module:routes/auth
 * @inner
 * @param {express.Request} req - The HTTP request.
 * @param {express.Response} res - The HTTP response.
 */
router.post("/unique", async (req, res) => {
  try {
    const { model } = req.body;

    const instances = await getInstances(prisma, model);
    const fields = await getModelFields(model);
    const uniqueFields = getUniqueFields(fields);
    const finalArray = getUniqueValues(instances, uniqueFields);

    res.json({ uniqueFields: finalArray });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

/**
 * Retrieves instances of a given model from the database.
 * @param {PrismaClient} prisma - The Prisma client instance.
 * @param {string} model - The model name.
 * @returns {Promise<Array>} - A promise that resolves to an array of model instances.
 */
async function getInstances(prisma, model) {
  return prisma[model].findMany();
}

/**
 * Retrieves the fields of a model from a JSON file.
 * @param {string} model - The model name.
 * @returns {Promise<Array>} - A promise that resolves to an array of model fields.
 */
async function getModelFields(model) {
  const modelConversion = {
    channel: "Channel",
    user: "User",
    directChat: "Directchat",
  };
  const jsons = JSON.parse(fs.readFileSync("./data/jsons/fields.json"));
  return jsons[modelConversion[model]];
}

/**
 * Filters and retrieves unique fields from an array of model fields.
 * @param {Array} fields - The array of model fields.
 * @returns {Array} - An array of unique fields.
 */
function getUniqueFields(fields) {
  return fields.filter((field) => field.unique === true);
}

/**
 * Extracts unique values of unique fields from an array of model instances.
 * @param {Array} instances - The array of model instances.
 * @param {Array} uniqueFields - The array of unique fields.
 * @returns {Array} - An array of unique field values.
 */
function getUniqueValues(instances, uniqueFields) {
  return instances.map((instance) => {
    const uniqueValues = {};
    uniqueFields.forEach((field) => {
      uniqueValues[field.field] = instance[field.field];
    });
    return uniqueValues;
  });
}

module.exports = router;
