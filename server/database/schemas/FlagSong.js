const mongoose = require("mongoose");
const {userModel} = require("./User");
const {formatModel} = require("./Format");

const flagsongSchema = new mongoose.Schema({
  posted_by: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: userModel,
  },
  replied_by: {
    type: [{type: mongoose.SchemaTypes.ObjectId, ref: "Flag Song"}],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  flagged: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model("Flag Song", flagsongSchema);