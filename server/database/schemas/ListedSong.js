const mongoose = require("mongoose");
const {songModel} = require("./Song");
const {artistModel} = require("./Artist");
const {formatModel} = require("./Format");

const listedSongSchema = new mongoose.Schema({
  creator: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: artistModel,
  },
  song: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: songModel,
  },
  formats: {
    type: [{type: mongoose.SchemaTypes.ObjectId, ref: formatModel}],
    default: []
  }
  // price isn't listed here because it's calculated from the formats
});

module.exports = {
  listedSongModel: mongoose.model("ListedSong", listedSongSchema),
  listedSongSchema
};
