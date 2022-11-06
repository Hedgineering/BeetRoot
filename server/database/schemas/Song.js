const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
  artist: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true
  },
  genre: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  explicit: {
    type: Boolean,
    required: true,
    default: false
  },
  license: {
    type: String,
    required: true,
    default: "Creative Commons"
  },
  description: {
    type: String,
    required: false
  },
  published: {
    type: Date,
    default: () => Date.now(),
    required: true,
  },
  coverArt: {
    type: String
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  shares: {
    type: Number,
    default: 0,
    min: 0
  },
  purchases: {
    type: Number,
    default: 0,
    min: 0
  },
  streams: {
    type: Number,
    default: 0,
    min: 0
  },
  audioData: {
    
  }
});

module.exports = {
  songModel: mongoose.model("Song", songSchema),
  songSchema,
}
