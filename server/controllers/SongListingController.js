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

/**
 * NPM Module dependencies.
 */
const express = require("express"); // Express web server framework
const multer = require("multer"); // Middleware for handling multipart/form-data
const mongoose = require("mongoose");
const fs = require("fs");

/**
 * NodeJS Module dependencies.
 */
const { Readable } = require("stream");

/**
 * Create Express server && Express Router configuration.
 */
const app = express();
const router = express.Router();
app.use("/tracks", router);

/**
 * Connect to MongoDB with mongoose
 */
mongoose
  .connect("mongodb://localhost:27017/testFileDb", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

const trackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  path: {
    type: String,
    required: [true, "Path to file is required"],
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
    immutable: true,
  },
});

const trackModel = mongoose.model("Track", trackSchema);

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
router.post("/", (req, res) => {
  // configure Multer to store files in disk
  // Multer is a middleware that takes request object
  const storage = multer.diskStorage({
    // callback to determine destination
    destination: (req, file, cb) => {
      // set destination to store files in disk at ./database/userFiles/audio
      cb(null, "./database/userFiles/audio");
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
    }
  });

  // upload.single("form input name") will return a function pointer
  // that takes a request response and callback function input and performs
  // multer middleware operations using the callbacks defined in the storage object
  upload.single("track")(req, res, (err) => {
    if (err) {
      console.log(err.message);
      return res.status(400).json({ message: "Upload Request Validation Failed" });
    } else if (!req.body.name) {
      return res.status(400).json({ message: "No track name in request body" });
    }

    // create a new track document in the tracks collection
    let trackName = req.file.originalname;
    let trackPath = req.file.path;
    trackModel.create({ name: trackName, path: trackPath }, (err, newTrack) => {
      if (err) {
        console.log(err.message);
        return res.status(500).json({ message: "Error saving track to database" });
      }
      console.log("trackName: ", trackName, " was uploaded successfully");
      return res.status(201).json({ message: "track uploaded successfully", track: newTrack._id });
    });
  });
});

/**
 * GET /tracks/:trackID
 */
router.get("/:trackID", (req, res, next) => {
  let trackID;
  try {
    trackID = new mongoose.Types.ObjectId(req.params.trackID);
  } catch (err) {
    return res.status(400).json({ message: "Invalid trackID in URL parameter." });
  }

  try {
    trackModel.findById(trackID, (err, track) => {
      if (err) {
        console.log(err.message);
        return res.status(500).json({ message: "Error fetching track from database" });
      }
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }
      // Track found successfully
      res.set("content-type", "audio/mp3");
      res.set("accept-ranges", "bytes");

      console.log("track path: ", `${__dirname}/${track.path}`);
      const fileStream = fs.createReadStream(`${__dirname}/${track.path}`);
      fileStream.on('open', () => {
        fileStream.pipe(res);
      });
      fileStream.on('error', (err) => {
        console.log(err.message);
        next(err);
      });
      fileStream.on('end', () => {
        console.log("fileStream ended");
      });
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "Error fetching track from database" });
  }
});

app.listen(3005, () => {
  console.log("App listening on port 3005!");
});