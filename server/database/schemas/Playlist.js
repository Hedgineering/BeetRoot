const mongoose = require("mongoose");
const { songModel } = require("./Song");

const playlistSchema = new mongoose.Schema({
  songs: {
    type: [{ type: mongoose.SchemaTypes.ObjectId, ref: songModel }],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
  totalDuration: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
  creationDate: {
    type: Date,
    default: () => Date.now(),
    required: true,
  },

});

module.exports = mongoose.model("Playlist", playlistSchema);
