"use strict";

// =========================
// Get Environment Variables
// =========================
const path = require("path");
const rootDir = path.resolve(__dirname, ".");
const env = require("dotenv").config({ path: `${rootDir}/.env` }).parsed;
const multer = require("multer");
const { readable } = require("stream");

if (!env) {
  console.log("Environment variables file not found");
}

// ==========================
// General Require Statements
// ==========================
const { song } = require("./database/schemas/Song");

const uploadSong = (req, res) => {
  const storage = multer.memoryStorage();
  //Maximum of 1 non-file field, a maximum filesize of 6mb (filesize denoted in bytes), a maximum of 1 file in the request and a maximum of 2 parts (files+fields). Multer will perform validation against these conditions and pass an error if it fails.
  const upload = multer({
    storage: storage,
    limits: { fields: 1, fileSize: 6000000, files: 1, parts: 2 },
  });

  //accept a single file with the name track
  upload.single("track")(req, res, (err) => {
    //Check for missing information
    if (err) {
      return res
        .status(400)
        .json({ message: "Upload Request Validation Failed" });
    } else if (!req.body.artist) {
      return res.status(400).json({ message: "No artist field" });
    } else if (!req.body.title) {
      return res.status(400).json({ message: "No song title" });
    } else if (!req.body.genre || req.body.genre.length === 0) {
      return res
        .status(400)
        .json({ message: "Song must have at least 1 genre" });
    }
  });

  const readableTrackStream = new Readable();
  readableTrackStream.push(req.file.buffer);
  readableTrackStream.push(null);

  //https://www.mongodb.com/docs/drivers/node/current/fundamentals/gridfs/
  let bucket = new mongodb.GridFSBucket(db, {
    bucketName: "trackBucket",
  });

  //returns a writable stream for writing buffers to GridFS. we pass it the name of the track from the request body(this will be the files name in gridFS) and assign it to a variable called uploadStream.
  //I'm not really sure how this part works.
  let uploadStream = bucket.openUploadStream(req.body.title);
  let id = uploadStream.id;
  //Push all the data to the writable uploadStream
  readableTrackStream.pipe(uploadStream);
  uploadStream.on("error", () => {
    return res.status(500).json({ message: "Error uploading file" });
  });

  uploadStream.on("finish", () => {
    return res
      .status(201)
      .json({
        message:
          "File uploaded successfully, stored under Mongo ObjectID: " + id,
      });
  });
  //Yeah I'm not really sure if I understand how this works. Is the bucket individual for every song or for every song together?
  //If the bucket is individual, then create a Song in the database. Code is unwritten but shouldn't be too difficult.
};

const getSong =
  ("/:trackID",
  (req, res) => {
    try {
      var trackID = new ObjectID(req.params.trackID);
    } catch (err) {
      return res
        .status(400)
        .json({
          message:
            "Invalid trackID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters",
        });
    }
    res.set("content-type", "audio/mp3");
    res.set("accept-ranges", "bytes");

    let bucket = new mongodb.GridFSBucket(db, {
      bucketName: "trackBucket",
    });

    downloadStream.on("data", (chunk) => {
      res.write(chunk);
    });

    downloadStream.on("error", () => {
      res.sendStatus(404);
    });

    downloadStream.on("end", () => {
      res.end();
    });
  });
