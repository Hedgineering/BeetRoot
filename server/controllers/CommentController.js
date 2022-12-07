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

  try {
    const listedSong = await listedSongModel.find({ _id: listingId }).exec();
    if (!listedSong) {
      return res.status(400).json({ error: "Invalid listing ID" });
    }
    if (!req.user) {
      return res.status(400).json({ error: "Invalid username" });
    }

    const foundUser = await userModel.findOne({ username: req.user }).exec();
    if (!foundUser) {
      return res.status(400).json({ error: "No user with username" });
    }

    const createdComment = await commentModel.create({
      listedSong: req.params.listingId,
      postedBy: foundUser._id,
      message: req.body.comment,
    });
    res.status(200).json({ message: "Comment Posted!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Failed to post comment" });
  }
};

module.exports = {
  postComment,
};
