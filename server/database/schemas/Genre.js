const mongoose = require("mongoose");
const { songModel } = require("./Song");

const roleSchema = new mongoose.Schema({
  songs: {
    type: [{ type: mongoose.SchemaTypes.ObjectId, ref: songModel }],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Genre", genreSchema);
