const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
    genre_id: {
        type: mongoose.SchemaTypes.ObjectID,
        required: true,
      },
    songs:  {
        type:  [mongoose.SchemaTypes.ObjectId],
        required: true,
    },
    name: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model("Genre", genreSchema);