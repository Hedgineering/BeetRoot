const mongoose = require("mongoose");
const { userModel } = require("./User");
const { listedSongModel } = require("./ListedSong");

const commentSchema = new mongoose.Schema({
  listedSong: {
    //type: mongoose.SchemaTypes.ObjectId,
    type: String,
    required: true,
    ref: listedSongModel,
  },
  postedBy: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: userModel,
  },
  repliedBy: {
    type: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Comment" }],
    required: true,
    default:[]
  },
  message: {
    type: String,
    required: true,
  },
  //True if string is not empty. String will contain reason comment was flagged.
  flagged: {
    type: String,
    required: true,
    default: "",
  },
  replies: {
    type: Number,
    required: true,
    default: 0,
  },
  votes: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = {
  commentModel: mongoose.model("Comment", commentSchema),
  commentSchema,
};
