const mongoose = require("mongoose");
const {userModel} = require("./User");

const commentSchema = new mongoose.Schema({
  posted_by: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: userModel,
  },
  replied_by: {
    type: [{type: mongoose.SchemaTypes.ObjectId, ref: "Comment"}],
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
  replies: {
    type: Number,
    required: true,
  },
  votes: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Comment", commentSchema);
