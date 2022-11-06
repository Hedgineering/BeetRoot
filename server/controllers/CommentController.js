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
const {SchemaType} = require("mongoose");
const { userModel } = require("../database/schemas/User");
const { commentModel } = require("../database/schemas/Comment");
const { listedSongModel } = require("../database/schemas/ListedSong");

// ==============================
// Endpoints for Posting Comments
// ==============================
const postComment = async (req, res, next) => {
  const token = req.body.token;
  const secret =
    process.env.ACCESS_TOKEN_SECRET ||
    env["ACCESS_TOKEN_SECRET"] ||
    "HedgineeringIsAwesome";

  let listingId;
  try {
    listingId = new SchemaType.ObjectId(req.body.listingId);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Invalid listing ID" });
  }

  await listedSongModel.find({_id: listingId}, (err, listing) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: "Invalid listing ID" });
    }
    if (listing.length === 0) {
      return res.status(400).json({ error: "Invalid listing ID" });
    }

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
        res.status(200).json({ message: "Comment Posted!" });
      }
    });
  })
};

module.exports = {
  postComment,
};