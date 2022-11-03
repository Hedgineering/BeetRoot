// =========================
// Get Environment Variables
// =========================
const path = require("path");
const rootDir = path.resolve(__dirname, ".");
const env = require("dotenv").config({ path: `${rootDir}/.env` }).parsed;

if (!env) {
  console.log("Environment variables file not found");
}

// ==========================
// General Require Statements
// ==========================
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../database/schemas/User");


// ====================================
// Endpoints for Registration and Login
// ====================================
const register = (req, res, next) => {
  //Increase the amount in gensalt to increase security but will slow down registration significantly.
  const salt = bcrypt.genSalt(10);
  const hashed_password = bcrypt.hash(req.body.password, salt);

  let user = new User({
    username: req.body.username,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: hashed_password,
    status: req.body.status || "User",
  });

  user
    .save()
    .then((user) => res.json({ message: "User added successfully" }))
    .catch((error) => { res.json({ message: "Error adding user" }); });

  //Redirect if success to login
};

const login = (req, res, next) => {
  const user = User.find((user) => (user.name = req.res.name));
  if (user == null) {
    return res.status(400).send("Cannot find user");
  }
  try {
    if (bcrypt.compare(req.body.password, user.password)) {
      res.send("Login Success");
    } else {
      res.send("Login Failure");
    }
  } catch {
    res.status(500).send();
  }
};

module.exports = {
  register,
  login,
};
