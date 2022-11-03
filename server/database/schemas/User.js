const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  roles: {
    type: [mongoose.SchemaTypes.ObjectId],
    // todo: 
  },
  history: mongoose.SchemaTypes.ObjectId,
  username: {
    type: String,
    required: true,
  },
  first_name: {
    type: String,
    default: "",
  },
  last_name: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "Normal",
  },
});

module.exports = mongoose.model("User", userSchema);
