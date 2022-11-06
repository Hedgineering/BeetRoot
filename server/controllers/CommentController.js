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
const jwt = require("jsonwebtoken");
const { userModel } = require("../database/schemas/User");
const { commentModel } = require("../database/schemas/Comment");

// ==============================
// Endpoints for Posting Comments
// ==============================
const postComment = (req, res, next) => {
  const token = req.body.token;
  const secret =
    process.env.ACCESS_TOKEN_SECRET ||
    env["ACCESS_TOKEN_SECRET"] ||
    "HedgineeringIsAwesome";

  jwt.verify(token, secret, (err, verifiedJwt) => {
    if (err) {
      res.status(400).json({ message: "Invalid Token" });
      return;
    } else {
      userModel.findOne({ username: verifiedJwt.username }, (err, user) => {
        if (err) {
          console.log(err);
          next(err);
        }
        if (user) {
          commentModel.create([
            {
              listedSong: req.params.listingId,
              postedBy: user._id,
              message: req.body.comment,
            },
          ]);
          return;
        }
      });
      console.log(verifiedJwt.username);
      console.log(req.params.listingID);
      console.log(req.body.comment);
      res.status(200).json({ message: "Comment Posted!" });
      //verifiedJwt is object of verified data
    }
  });
};

module.exports = {
  postComment,
};
