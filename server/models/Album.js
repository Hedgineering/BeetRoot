const mongoose = require("mongoose");
const { artistModel } = require("./Artist");
const { songModel } = require("./Song");
const { genreModel } = require("./Genre");

const albumSchema = new mongoose.Schema({
  songs: {
    type: [{ type: mongoose.SchemaTypes.ObjectId, ref: songModel }],
    required: true,
  },
  artist: {
    type: mongoose.SchemaTypes.ObjectID,
    required: true,
    ref: artistModel,
  },
  genre: {
    type: mongoose.SchemaTypes.ObjectID,
    required: true,
    ref: genreModel,
  },
  title: {
    type: String,
    required: true,
  },
  length: {
    type: Number,
    required: true,
  },
  published: {
    type: Date,
    required: true,
    default: () => Date.now(),
  },
  price: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Album", albumSchema);
