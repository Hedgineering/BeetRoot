const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  clearanceLevel: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Role", roleSchema);
