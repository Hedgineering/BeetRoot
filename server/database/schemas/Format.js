const mongoose = require("mongoose");
const { songModel } = require("./Song");

const formatSchema = new mongoose.Schema({
  song: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: songModel,
  },
  price: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  preview: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
});

module.exports = {
  formatModel: mongoose.model("Format", formatSchema),
  formatSchema,
};
