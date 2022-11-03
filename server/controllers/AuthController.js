"use strict";

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
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {userModel} = require("../database/schemas/User");
const {roleModel} = require("../database/schemas/Role");

// ====================================
// Endpoints for Registration and Login
// ====================================
const register = (req, res) => {
  //Increase the amount in gensalt to increase security but will slow down registration significantly.
  const salt = bcrypt.genSalt(10);
  const hashed_password = bcrypt.hash(req.body.password, salt);

  // requested roles to be used for applying roles if valid
  let requestedRoles = [];

  // validate request roles
  const roles = roleModel.find({}).select({name: 1, _id: 0}).then((roles) => {
    const userRolesSet = new Set(req.body.roles);

    // check if the roles in the request body are only the ones in the database
    if (userRolesSet.size !== req.body.roles.length) {
      res.status(400).send({ message: "Roles must be valid. You have too many types of roles!" });
      return;
    }
    roles.every((role) => {
      // We don't allow external users to create admin users
      if (!userRolesSet.has(role.name) && role.name !== "Admin") {
        res.status(400).send({ message: "Roles must be valid. Incorrect roles requested." });
        return;
      }
    });

    // if all roles are valid, then add their roleIds to the requestedRoles array
    requestedRoles = roles.filter((role) => userRolesSet.has(role.name)).map((role) => role._id);
  });

  userModel
    .find({})
    .then(async (users) => {
      if (users.length === 0) {
        await userModel.create([
          {
            username: req.body.username,
            firstName: req.body.first_name,
            lastName: req.body.last_name,
            password: hashed_password,
            email: req.body.email,
            status: req.body.status || "Normal",
            roles: requestedRoles,
          },
        ]);
      }
    })
    .catch((error) => {
      // only log error internally, exposing error to user is a security risk
      console.log(error);
      res.status(500).send({ message: "Error registering user" });
    });
};

const login = (req, res) => {
  //Redirect if success to login
  const user = userModel.find((user) => (user.name = req.res.name));
  if (user == null) {
    res.status(400).send({ message: "Cannot find user" });
    return;
  }
  try {
    if (bcrypt.compare(req.body.password, user.password)) {
      const secret = process.env.ACCESS_TOKEN_SECRET || env["ACCESS_TOKEN_SECRET"] || "HedgineeringIsAwesome";
      const token = jwt.sign(user, secret);

      res.status(200).send({ message: "Success", token: token });
    } else {
      res.status(400).send({ message: "Cannot find user" });
    }
  } catch {
    res.status(500).send();
  }
};

module.exports = {
  register,
  login,
};
