const mongoose = require("mongoose");
const Joi = require("joi");

const reviewSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  rating: { type: Number, required: true },
  comments: { type: String },
  createdAt: { type: Date, default: Date.now },
  isVisible: { type: Boolean, default: true },
});

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
  reviews: [reviewSchema], // Include the reviews field as an array of reviewSchema
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
    description: Joi.string(),
    reviews: Joi.array().items(Joi.object({
      userName: Joi.string().required(),
      rating: Joi.number().required(),
      comments: Joi.string().required(), // Change comments to an array of strings
      createdAt: Joi.date().default(Date.now),
    })),
  });

  return schema.validate(list);
}

module.exports = { List, validateList };
