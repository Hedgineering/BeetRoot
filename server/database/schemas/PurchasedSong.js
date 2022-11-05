const mongoose = require("mongoose");

const purchasedSongSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
  },
  song_id: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
  },
  format_id: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
  },
  tags: [mongoose.SchemaTypes.ObjectId],
});

module.exports = {
  purchasedSongModel: mongoose.model("PurchasedSong", purchasedSongSchema),
  purchasedSongSchema,
};
