const { roleModel } = require("./Role");
const { historyModel } = require("./History");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  roles: {
    type: [mongoose.SchemaTypes.ObjectId],
    ref: roleModel,
    required: true,
  },
  history: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: historyModel,
  },
  username: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    default: "",
  },
  lastName: {
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

// This is a pre-save hook that will run before the user is saved to the database
// It will ensure that a user has a history object associated with them
userSchema.post("save", async function (doc, next) {
  if(doc.history) {
    next();
    return;
  }

  const history = new historyModel({ userId: doc._id });
  await history.save();
  next();
});

module.exports = {
  userModel: mongoose.model("User", userSchema),
  userSchema,
};
