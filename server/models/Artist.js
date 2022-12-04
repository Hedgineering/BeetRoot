const mongoose = require("mongoose");
const { userModel } = require("./User");

const artistSchema = new mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: userModel,
  },
  genre: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: "Genre",
  },
  songs: {
    type: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Song" }],
    default: [],
  },
});

module.exports = {
  artistModel: mongoose.model("Artist", artistSchema),
  artistSchema,
};
