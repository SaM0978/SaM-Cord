/**
 * Imports
 * @namespace
 */
const prisma = require("../data/prismaUtils"); // Prisma client instance
const { jsonData } = require("./Common.js"); // Custom module for generating JSON file paths

/**
 * Parent class representing a generic model.
 * @class
 */
class Parent {
  /**
   * Creates an instance of Parent.
   * @constructor
   * @param {Object} options - Options for initializing the Parent instance.
   * @param {string} options.model - The model name.
   * @param {PrismaClient} options.prisma - The Prisma client instance.
   */
  constructor({ model }) {
    /**
     * The model name.
     * @member {string}
     */
    this.model = model;

    /**
     * The Prisma client instance.
     * @member {PrismaClient}
     */
    this.prisma = prisma;
  }

  /**
   * Asynchronously updates the data of a model.
   * @async
   * @param {string} id - The ID of the model instance to update.
   * @param {Object} changingData - An object containing the field and value to be updated.
   * @returns {Promise<string>} A Promise that resolves to a message indicating that the data has been changed.
   */
  async change(id, changingData) {
    /**
     * Change the data of a model
     */

    let data = { [changingData.field]: changingData.value };
    await prisma[this.model].update({
      where: { id: id },
      data,
    });
    return "Data Changed";
  }

  /**
   * Retrieves the fields of the model.
   * @param {boolean} [req=true] - Specifies whether to return only required fields. Defaults to true.
   * @returns {string[]} An array of field names.
   */
  fields(req = true) {
    const JsonData = jsonData("fields");
    const neededFields = JsonData[`${this.model}`];
    const conclusiveFields = req
      ? neededFields.filter((field) => field.required)
      : neededFields;
    return conclusiveFields.map((field) => field.field);
  }

  rawFields(req = true) {
    const JsonData = jsonData("fields");
    const neededFields = JsonData[`${this.model}`];
    const conclusiveFields = req
      ? neededFields.filter((field) => field.required)
      : neededFields;
    return conclusiveFields;
  }

  /**
   * Retrieves the identifier of a field in the model.
   * @param {string} field - The field name to find.
   * @param {boolean} [req=true] - Specifies whether to return only required fields. Defaults to true.
   * @returns {string | null} The field name if found, otherwise null.
   */
  fieldIdentifier(field, req = true) {
    let fields = this.fields();
    let [isField] = fields.filter((modelField) => {
      if (modelField.toLowerCase() === field.toLowerCase()) return modelField;
    });
    return isField ? isField : null;
  }

  /**
   * Asynchronously deletes a model instance.
   * @async
   * @param {string} id - The ID of the model instance to delete.
   * @returns {Promise<string>} A Promise that resolves to a message indicating that the data has been deleted.
   */
  async delete(id) {
    try {
      await this.prisma[`${this.model}`]["delete"]({
        where: { id: id },
      });
      console.log(`Data with ID ${id} deleted successfully`);
      return "Data Deleted";
    } catch (error) {
      console.error(`Error deleting data with ID ${id}:`, error);
      throw new Error("Could not delete data");
    }
  }

  /**
   * Asynchronously checks if an instance with the specified identifier exists.
   * @async
   * @param {string} identifier - The identifier to check against (e.g., field name).
   * @param {any} value - The value of the identifier to check against.
   * @returns {Promise<boolean>} A Promise that resolves to true if an instance with the specified identifier exists, otherwise false.
   */
  async instanceExists(identifier, value) {
    if (
      await this.prisma[`${this.model}`].findUnique({
        where: { [identifier]: value },
      })
    ) {
      return true;
    } else true;
  }

  /**
   * Asynchronously creates sample data for the model.
   * @async
   * @returns {Promise<void>} A Promise that resolves once sample data is created.
   */
  async sampleCreate() {
    const fields = this.rawFields();
    const data = {};
    const counter = Math.floor(Math.random() * 1000); // Generate a random number for uniqueness

    fields.forEach((field) => {
      switch (field.type) {
        case "string":
          data[field.field] = `Sample ${this.model}`;
          break;
        case "email":
          data[field.field] = `Sample${counter}@${this.model}.com`; // Append counter to ensure uniqueness
          break;
        case "integer":
          data[field.field] = 1;
          break;
        case "boolean":
          data[field.field] = true;
          break;
        default:
          throw new Error(`Unknown field type for field ${field}`);
      }
    });

    try {
      await this.prisma[this.model].create({
        data,
      });
      console.log(`Successfully created sample data for model ${this.model}`);
    } catch (error) {
      console.error(
        `Error creating sample data for model ${this.model}:`,
        error
      );
    } finally {
      await this.prisma.$disconnect();
    }
  }
}

module.exports = { Parent };
