const mongoose = require("mongoose");
const { artistModel } = require("../models/Artist");
const { genreModel } = require("../models/Genre");
const { userModel } = require("../models/User");
const { songModel } = require("../models/Song");
const ROLES_LIST = require("../config/RolesList");

/**
 * Gets list of existing Songs
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and list of Songs
 */
const getSongs = async (req, res) => {
  try {
    const Songs = await songModel.find({}).exec();
    return res.status(200).json({ result: Songs, message: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ result: [], message: "Error getting Songs" });
  }
};

/**
 * Takes request with Song id and returns Song object if it exists, null otherwise
 * Expects Song id as url parameter:
 *
 * Ex: www.beetroot.com/api/Song/5f9f1b9f9f1b9f1b9f1b9f1b
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and queried Song
 */
const getSong = async (req, res) => {
  try {
    const Song = await songModel.findById(req.params.id).exec();
    return res.status(200).json({ result: Song, message: "Success" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ result: null, message: "Error getting Song" });
  }
};

/**
 * Takes request with Song name and returns genre object created
 * Expects:
 * ```json
 * { "name": String, "songs": [String] }
 * ```
 * songs should be an array of song ids in String format, can be empty
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and created genre
 */
const createSong = async (req, res) => {
  try {
    let {
      artist,
      genre,
      title,
      duration,
      explicit,
      license,
      description,
      published,
      coverArt,
      likes,
      shares,
      purchases,
      streams,
    } = req.body;
    console.log(req.body);
    console.log(req);
    if (
      !artist ||
      !genre ||
      !title ||
      !duration ||
      !explicit ||
      !description ||
      !published ||
      !coverArt ||
      !likes ||
      !shares ||
      !purchases ||
      !streams
    ) {
      return res
        .status(400)
        .json({ result: null, message: "Song name is required" });
    }

    const Song = await songModel.create({
      artist,
      genre,
      title,
      duration,
      explicit,
      license,
      description,
      published,
      coverArt,
      likes,
      shares,
      purchases,
      streams,
    });
    return res.status(200).json({ result: Song, message: "Success" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ result: null, message: "Error creating Song" });
  }
};

/**
 * Takes request with Song name and returns Song object updated as result
 * Replaces existing Song with new Song created with passed name and songs
 *
 * Expects:
 * ```json
 * { "id": String, "name": String, "songs": [String] }
 * ```
 * id and name are required, with id being the object id of the Song to update in String format
 *
 * songs should be an array of song ids in String format, can be empty
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and updated Song
 */
const updateSong = async (req, res) => {
  try {
    let {
      artist,
      genre,
      title,
      duration,
      explicit,
      license,
      description,
      published,
      coverArt,
      likes,
      shares,
      purchases,
      streams,
    } = req.body;
    if (
      !artist ||
      !genre ||
      !title ||
      !duration ||
      !explicit ||
      !description ||
      !published ||
      !coverArt ||
      !likes ||
      !shares ||
      !purchases ||
      !streams
    ) {
      return res
        .status(400)
        .json({ result: null, message: "Song name and id is required" });
    }
    const SongToUpdate = await songModel.findById(id).exec();
    if (!SongToUpdate) {
      return res
        .status(400)
        .json({ result: null, message: `Invalid Song id ${id}` });
    }

    const newSong = await songModel
      .findByIdAndUpdate(
        id,
        {
          artist,
          genre,
          title,
          duration,
          explicit,
          license,
          description,
          published,
          coverArt,
          likes,
          shares,
          purchases,
          streams,
        },
        { new: true }
      )
      .exec();

    return res.status(200).json({ result: newSong, message: "Success" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ result: null, message: "Error updating Song" });
  }
};

/**
 * Takes request with Song id and songs to insert and returns Song object updated
 *
 * Expects:
 * ```json
 * { "id": String, "songs": [String] }
 * ```
 * id is required, with id being the object id of the Song to update in String format
 *
 * songs is required, with songs being an array of song ids in String format
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and updated genre
 */
const updateSongProperties = async (req, res) => {
  const { user, roles } = req;
  const {
    songId,
    artist,
    genre,
    title,
    duration,
    explicit,
    license,
    description,
    published,
    coverArt,
    likes,
    shares,
    purchases,
    streams,
  } = req.body;
  const properties = {
    artist,
    genre,
    title,
    duration,
    explicit,
    license,
    description,
    published,
    coverArt,
    likes,
    shares,
    purchases,
    streams,
  };
  try {
    const SongToUpdate = await songModel.findById(songId).exec();
    if (!SongToUpdate) {
      return res
        .status(400)
        .json({ result: null, message: `Invalid Song id ${id}` });
    }
    if (!(await canAccess(user, roles, songId))) {
      return res.status(403).json({ result: null, message: "Unauthorized" });
    }
    for (const property in properties) {
      if (properties[property] && property in SongToUpdate) {
        SongToUpdate[property] = properties[property];
      }
    }
    SongToUpdate.save();
  } catch (error) {
    console.log(err);
    return res
      .status(500)
      .json({ result: null, message: "Error updating Song properties" });
  }
};

/**
 * Takes request with Song id of Song to delete
 *
 * Expects:
 * ```json
 * { "id": String }
 * ```
 * id is required, with id being the object id of the Song to delete in String format
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message
 */
const deleteSong = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res
        .status(400)
        .json({ result: null, message: "Song id is required" });
    }
    const SongToDelete = await songModel.findById(id).exec();
    if (!SongToDelete) {
      return res
        .status(400)
        .json({ result: null, message: `Invalid Song id ${id}` });
    }
    await SongModel.findByIdAndDelete(id).exec();
    return res.status(200).json({ result: null, message: "Success" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ result: null, message: "Error deleting Song" });
  }
};

const canAccess = async (username, roles, songId) => {
  if (!roles || !username || !songId) {
    return false;
  }

  try {
    const currentArtist = artistModel.findOne({ user: username }).exec();
    const currentSong = songModel.findById(songId).exec();
    if (!currentArtist || !currentSong) {
      return false;
    }
    if (
      !roles.includes(ROLES_LIST.ADMIN) &&
      currentArtist._id != currentSong.artist
    ) {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
};

module.exports = {
  getSongs,
  getSong,
  createSong,
  updateSong,
  updateSongProperties,
  deleteSong,
};
