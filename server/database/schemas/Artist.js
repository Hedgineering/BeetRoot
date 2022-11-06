const mongoose = require("mongoose");
const { userModel } = require("./User");
const { songModel } = require("./Song");
const {genreModel} = require("./Genre")

const artistSchema = new mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectID,
    required: true,
    ref: userModel,
  },
  genre: {
    type: mongoose.SchemaTypes.ObjectID,
    required: true,
    ref: genreModel,
  },
  songs: {
    type: [{ type: mongoose.SchemaTypes.ObjectId, ref: songModel }],
    default: [],
  },
});

module.exports = {
  artistModel: mongoose.model("Artist", artistSchema),
  artistSchema,
};
