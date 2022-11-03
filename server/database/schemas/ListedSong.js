const mongoose = require("mongoose");

const listedSongSchema = new mongoose.Schema({
    creator: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },
    song: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },
    formats: {
        type: [mongoose.SchemaTypes.ObjectId],
        required: true,
    },
    Price: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model("ListedSong", listedSongSchema)




