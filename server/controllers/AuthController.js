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
const { userModel } = require("../models/User");
const { roleModel } = require("../models/Role");

// ====================================
// Endpoints for Registration and Login
// ====================================
const register = (req, res) => {
  if (!req.body || !req.body.password) {
    res.status(400).json({ message: "Password is required" });
    return;
  }
  let requestedRoleStrings = [];
  if (!req.body.roles || req.body.roles.length === 0) {
    requestedRoleStrings.push("Listener");
  } else {
    requestedRoleStrings = Array.from(req.body.roles);
  }
  if (
    !req.body.username ||
    !req.body.email ||
    !req.body.firstName ||
    !req.body.lastName ||
    !req.body.status
  ) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  userModel.findOne({ username: req.body.username }, (err, user) => {
    if (err) {
      console.log(err);
    }
    if (user) {
      res.status(400).json({ message: "Username already exists" });
      return;
    }
    // Make sure that req.body.roles doesn't contain "Admin" role
    if (requestedRoleStrings.includes("Admin")) {
      res
        .status(400)
        .json({ message: "Admin role cannot be assigned to a user" });
      return;
    }

    //Increase the amount in gensalt to increase security but will slow down registration significantly.
    const saltRounds = 10;
    bcrypt.hash(req.body.password, saltRounds, function (err, hashedPassword) {
      // Store hash in database here
      // requested roles to be used for applying roles if valid
      let requestedRoles = [];

      // validate request roles
      const roles = roleModel
        .find({})
        .select({ name: 1, _id: 1 })
        .then(async (roles) => {
          const userRolesSet = new Set(roles.map((role) => role.name));
          console.log(userRolesSet);

          // check if the roles in the request body are only the ones in the database
          if (userRolesSet.size < requestedRoleStrings.length) {
            res.status(400).json({
              message: "Roles must be valid. You have too many types of roles!",
            });
            return;
          }
          for (let role of requestedRoleStrings) {
            console.log("checking role: " + role);
            if (!userRolesSet.has(role)) {
              res.status(400).json({
                message: "Roles must be valid. Incorrect roles requested.",
              });
              return;
            }
          }

          requestedRoleStrings = new Set(requestedRoleStrings);
          console.log(roles);

          // if all roles are valid, then add their roleIds to the requestedRoles array
          requestedRoles = roles
            .filter((role) => requestedRoleStrings.has(role.name))
            .map((role) => role._id);
          console.log("requestedRoles: ", requestedRoles);
          try {
            await userModel.create([
              {
                username: req.body.username,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                password: hashedPassword,
                email: req.body.email,
                status: req.body.status || "Normal",
                roles: requestedRoles,
              },
            ]);
            res.status(200).json({ message: "User registered successfully!" });
          } catch (error) {
            // only log error internally, exposing error to user is a security risk
            console.log(error);
            res.status(500).json({ message: "Error registering user" });
          }
        });
    });
  });
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const foundUser = await userModel.findOne({ username: user }).exec();
    if (!foundUser)
      return res.status(401).json({ message: "No user with that username." }); //Unauthorized

    const match = await bcrypt.compare(pwd, foundUser.password);
    if (!match) return res.status(401).json({ message: "Incorrect Password." }); //Unauthorized

    const rolesObjects = await roleModel
      .find({ _id: { $in: foundUser.roles } })
      .exec();
    const roles = rolesObjects.map((role) => role.name);

    const accessSecret =
      process.env.ACCESS_TOKEN_SECRET ||
      env["ACCESS_TOKEN_SECRET"] ||
      "HedgineeringIsAwesome";
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles: roles,
        },
      },
      accessSecret,
      { expiresIn: 60 }
    );

    const refreshSecret =
      process.env.REFRESH_TOKEN_SECRET ||
      env["REFRESH_TOKEN_SECRET"] ||
      "HedgineeringIsAwesome";
    const refreshToken = jwt.sign(
      { username: foundUser.username },
      refreshSecret,
      { expiresIn: "1d" }
    );

    // Saving refreshToken with current user
    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();

    // Creates Secure Cookie with refresh token
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Send authorization roles and access token to user
    return res
      .status(200)
      .json({ roles, accessToken, message: "Login Success!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error logging in" });
  }
};

module.exports = {
  register,
  login,
};
