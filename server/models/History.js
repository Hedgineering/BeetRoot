const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.SchemaTypes.ObjectID,
    required: true,
    ref: "User",
  },
  streams: {
    type: [
      {
        song: {
          type: mongoose.SchemaTypes.ObjectID,
          required: true,
        },
        times_streamed: {
          type: Number,
          default: 0,
          required: true,
        },
      },
    ],
  },
});

module.exports = {
  historyModel: mongoose.model("History", historySchema),
  historySchema,
};