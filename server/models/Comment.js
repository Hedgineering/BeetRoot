const mongoose = require("mongoose");
const { userModel } = require("./User");
const { listedSongModel } = require("./ListedSong");

const commentSchema = new mongoose.Schema({
  parentComment: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Comment",
  },
  listedSong: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: listedSongModel,
  },
  postedBy: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: userModel,
  },
  message: {
    type: String,
    required: true,
  },
  repliedBy: {
    type: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Comment" }],
    //required: true,
    default: [],
  },
  //True if string is not empty. String will contain reason comment was flagged.
  flagged: {
    type: String,
    default: "",
  },
  replies: {
    type: Number,
    default: 0,
  },
  votes: {
    type: Number,
    default: 0,
  },
});

module.exports = {
  commentModel: mongoose.model("Comment", commentSchema),
  commentSchema,
};
