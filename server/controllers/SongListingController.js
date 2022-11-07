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
const { listedSongModel } = require("../database/schemas/ListedSong");
const { artistModel } = require("../database/schemas/Artist");
const { songModel } = require("../database/schemas/Song");
const { formatModel } = require("../database/schemas/Format");

/**
 * NPM Module dependencies.
 */
const multer = require("multer"); // Middleware for handling multipart/form-data
const mongoose = require("mongoose");
const fs = require("fs");


/**
 * Returns true if file is an .mp3 or .wav file.
 */
function isValidAudioFile(filename) {
  return /([a-zA-Z0-9\s_\\.\-\(\):])+(.mp3|.wav)$/i.test(filename);
}

/**
 * Returns file extension of a file.
 */
function getFileExtension(filename) {
  return filename.match(/\.[0-9a-z]+$/i)[0];
}

/**
 * Returns unique filename using some prefix, current date, and filename.
 */
function getUniqueFileName(filename, prefix = "") {
  return `${prefix}_${Date.now()}_${getFileExtension(filename)}`;
}

/**
 * POST /tracks
 */
const createSongListing = (req, res) => {
  const token = req.body.token;
  const secret =
    process.env.ACCESS_TOKEN_SECRET ||
    env["ACCESS_TOKEN_SECRET"] ||
    "HedgineeringIsAwesome";
  // configure Multer to store files in disk
  // Multer is a middleware that takes request object
  const storage = multer.diskStorage({
    // callback to determine destination
    destination: (req, file, cb) => {
      // set destination to store files in disk at ./database/userFiles/audio
      cb(null, "../database/userFiles/audio");
    },
    // callback to determine filename
    filename: (req, file, cb) => {
      cb(null, getUniqueFileName(file.originalname, file.fieldname));
    },
  });
  const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      if (file.mimetype !== "audio/mpeg") {
        return cb(new Error("Only mp3 and wav files are allowed!"), false);
      }
      // regex validate file extension
      if (!isValidAudioFile(file.originalname)) {
        return cb(new Error("Only mp3 and wav files are allowed!"), false);
      }
      return cb(null, true);
    },
  });

  // upload.single("form input name") will return a function pointer
  // that takes a request response and callback function input and performs
  // multer middleware operations using the callbacks defined in the storage object
  upload.single("track")(req, res, (err) => {
    if (err) {
      console.log(err.message);
      return res
        .status(400)
        .json({ message: "Upload Request Validation Failed" });
    } else if (!req.body.name) {
      return res.status(400).json({ message: "No track name in request body" });
    }

    // create a new track document in the tracks collection
    let trackName = req.file.originalname;
    let trackPath = req.file.path;
    jwt.verify(token, secret, (err, verifiedJwt) => {
      if (err) {
        res.status(400).json({ message: "Invalid Token" });
        return;
      } else {
        userModel.findOne(
          { username: verifiedJwt.username },
          async (err, userDoc) => {
            if (err) {
              console.log(err);
              next(err);
            }
            if (userDoc) {
              let artistProfile = await artistModel.findOne({
                user: userDoc._id
              });

              let artistSong = await songModel.create({
                artist: artistProfile._id,
                genre: req.body.genre,
                title: req.body.title || trackName,
                duration: req.body.duration,
                explicit: req.body.explicit,
                license: req.body.license,
                description: req.body.description,
                published: req.body.published,
                coverArt: req.body.coverArt,
              });

              //Seeding Listed Song Data
              let artistListedSong = await listedSongModel.create({
                creator: artistProfile._id,
                song: artistSong._id,
              });

              //Seeding Format Data
              let formatOne = await formatModel.create({
                song: artistSong._id,
                price: req.body.price,
                type: req.body.type,
                preview: `${__dirname}/${trackPath}`,
                source: `${__dirname}/${trackPath}`,
              });

              //Updating Song with Format
              await listedSongModel.updateOne(
                { _id: artistListedSong._id },
                { $set: { formats: [formatOne._id] } }
              );
              return res.status(200).json({ 
                message: "Successfull Upload"
              });
            }
          }
        );
        res.status(200).json({ message: "Comment Posted!" });
      }
    });
  });
};

/**
 * GET /tracks/:trackID
 */
const getAllSongListings = async(req, res, next) => {
  try{
    let songListings = await listedSongModel.find({});
    if (songListings) {
      return res.status(200).json({
        message: "Successfully Retrieved Song Listings",
        listings: songListings
      })
    }
    else return res.status(400).json({
      message: "Could not find Song Listings"
    })
  }
  catch(error){
    console.log(error);
    next(error);
  }
};

const getSpecificSongListing = async (req, res, next) => {
  try {
    let songListing = await listedSongModel.findOne({_id:req.params.listingId});
    if (songListing) {
      return res.status(200).json({
        message: "Successfully Retrieved Song Listings",
        listings: songListing,
      });
    } else
      return res.status(400).json({
        message: "Could not find Song Listings",
      });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  createSongListing,
  getAllSongListings,
  getSpecificSongListing,
};