"use strict";

// ==========================
// General Require Statements
// ==========================
const { Types } = require("mongoose");
const { userModel } = require("../models/User");
const { commentModel } = require("../models/Comment");
const { listedSongModel } = require("../models/ListedSong");

// ==============================
// Endpoints for Posting Comments
// ==============================
const postComment = async (req, res) => {
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

const getComment = async (req, res) => {
  let commentID = req.params.id;
  if(!commentID){
    return res.status(400).json({message: "No ID provided"})
  }
  try{
    const queriedComment = await commentModel.findById(commentID).exec();
    return res.status(200).json({result: queriedComment, message: "Success"})
  } catch(error){
    console.log(error);
    return res.status(500).json({ result: [], message: "Error getting comment" });
  }
}

const getComments = async (req,res) => {
  try{
    const queriedComments = await commentModel.find({}).exec();
    return res.status(200).json({result: queriedComments, message: "Success"})
  } catch(error){
    console.log(err);
    return res.status(500).json({ result: [], message: "Error getting comments" });
  }
}


module.exports = {
  postComment,
  getComment,
  getComments,
};
