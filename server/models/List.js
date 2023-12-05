const mongoose = require("mongoose");
const Joi = require("joi");

const listSchema = new mongoose.Schema({
  name: { type: String, required: true },
  creator: {
    nickname: { type: String, required: true },
    email: { type: String, required: true },
  },
  heroes: [{ type: String, required: true }],
  averageRating: { type: Number, default: 0 },
  private: { type: Boolean, default: false },
  lastModified: { type: Date, default: Date.now },
  description: { type: String },
});

const List = mongoose.model("List", listSchema);

function validateList(list) {
  const schema = Joi.object({
    name: Joi.string().required(),
    creator: Joi.object({
      nickname: Joi.string().required(),
    }),
    heroes: Joi.array().items(Joi.string()).required(),
    averageRating: Joi.number().default(0),
    private: Joi.boolean().default(false),
    lastModified: Joi.date().default(Date.now),
  });

  return schema.validate(list);
}

module.exports = { List, validateList };
