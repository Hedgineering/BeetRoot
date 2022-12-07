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
const { Types } = require("mongoose");
const { userModel } = require("../models/User");
const { commentModel } = require("../models/Comment");
const { listedSongModel } = require("../models/ListedSong");

// ==============================
// Endpoints for Posting Comments
// ==============================
const postComment = async (req, res, next) => {
  let listingId;
  try {
    listingId = new Types.ObjectId(req.params.id);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Invalid listing ID" });
  }

  console.log(`Searching for listing with ID ${listingId}`);

  listedSongModel.find({ _id: listingId }, (err, listing) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: "Invalid listing ID" });
    }
    if (listing.length === 0) {
      return res.status(400).json({ error: "Invalid listing ID" });
    }

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
  });
};

module.exports = {
  postComment,
};
