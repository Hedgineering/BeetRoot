const mongoose = require("mongoose");
const { songModel } = require("./Song");

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  songs: {
    type: [{ type: mongoose.SchemaTypes.ObjectId, ref: songModel }],
    default: [],
  },
});

module.exports = {
  genreModel: mongoose.model("Genre", genreSchema),
  genreSchema
};
