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
 * @returns json object with message and result containing list of songs if found
 */
const getSongs = async (req, res) => {
  try {
    const songs = await songModel.find({}).exec();
    return res.status(200).json({ result: songs, message: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ result: [], message: "Error getting Songs" });
  }
};

/**
 * Takes request with Song id and returns Song object if it exists, null otherwise
 * Expects Song id as url parameter:
 *
 * Ex: www.beetroot.com/api/song/5f9f1b9f9f1b9f1b9f1b9f1b
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and queried song
 */
const getSong = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ result: null, message: "Song id is required" });
  }
  try {
    const song = await songModel.findById(id).exec();
    return res.status(200).json({ result: song, message: "Success" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ result: null, message: "Error getting Song" });
  }
};

/**
 * Takes request with song artist, genre, title, duration,
 * explicit, license, description, published, and
 * coverArt url and creates a new song, adds it to the
 * artist's songs, and songs associated with the passed genre
 * and returns song object created.
 *
 * Expects:
 * ```json
 * {
 *  "artist": String,
 *  "genre": String,
 *  "title": String,
 *  "duration": Number,
 *  "explicit": Boolean,
 *  "license": String,
 *  "description": String,
 *  "published": Date,
 *  "coverArt": String,
 * }
 * ```
 * artist and genre should be object ids in String format, required
 *
 * title, license, and description should be Strings, required
 *
 * duration should be the duration in seconds of the song as a Number, required
 *
 * explicit should be true if the song contains explicit content, false otherwise, required
 *
 * published should be the date the song was published as a Date, required
 *
 * coverArt should be a url to the cover art of the song as a String, required
 *
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
    } = req.body;
    const likes = 0,
      shares = 0,
      purchases = 0,
      streams = 0;

    if (
      !artist ||
      !genre ||
      !title ||
      !duration ||
      !explicit ||
      !description ||
      !published ||
      !coverArt
    ) {
      return res.status(400).json({ result: null, message: "Missing inputs" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(artist) ||
      !mongoose.Types.ObjectId.isValid(genre)
    ) {
      return res.status(400).json({ result: null, message: "Invalid inputs" });
    }

    const Artist = await artistModel.findById(artist).exec();
    if (!Artist) {
      return res
        .status(400)
        .json({ result: null, message: "Invalid artist id" });
    }

    const Genre = await genreModel.findById(genre).exec();
    if (!Genre) {
      return res
        .status(400)
        .json({ result: null, message: "Invalid genre id" });
    }

    const {user, roles} = req;
    if(!user || !roles) {
      return res.status(401).json({result: null, message: "Unauthorized"});
    }
    const User = userModel.findOne({username: user}).exec();
    if(!User) {
      return res.status(401).json({result: null, message: "Invalid user, unauthorized"});
    }

    if(!roles.includes(ROLES_LIST.ADMIN) 
    && !(Artist.user.toString() === User._id.toString())) {
      return res.status(401).json({result: null, message: "Unauthorized, you may not create a song under another artist's name"});
    }

    // check if song with same artist and title and description already exists
    const existingSong = await songModel
      .findOne({
        artist,
        title,
        description,
      })
      .exec();
    if (existingSong) {
      return res
        .status(400)
        .json({
          result: null,
          message: "Song with same name, title, and description already exists",
        });
    }

    const song = await songModel.create({
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

    // add song to artist's songs
    Artist.songs.unshift(song);
    const updatedArtist = await Artist.save();

    // add song to genre's songs
    Genre.songs.unshift(song);
    const updatedGenre = await Genre.save();

    return res.status(200).json({ result: song, message: "Success" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ result: null, message: "Error creating Song" });
  }
};

/**
 * Takes request with song artist, genre, title, duration,
 * explicit, license, description, published, coverArt url 
 * and updates the song with passed parameters,
 * if the new artist is different, it adds the song to the new
 * artist's songs, removes from old artist's songs, and 
 * if the new genre is different, it adds it to the songs associated with the 
 * newly passed genre, removes from old genre's songs
 * and returns song object updated.
 *
 * Expects:
 * ```json
 * {
 *  "songId": String,
 *  "artist": String,
 *  "genre": String,
 *  "title": String,
 *  "duration": Number,
 *  "explicit": Boolean,
 *  "license": String,
 *  "description": String,
 *  "published": Date,
 *  "coverArt": String,
 * }
 * ```
 * 
 * songId should be the object id of the song to update as a String, required
 * 
 * artist and genre should be object ids in String format, required
 *
 * title, license, and description should be Strings, required
 *
 * duration should be the duration in seconds of the song as a Number, required
 *
 * explicit should be true if the song contains explicit content, false otherwise, required
 *
 * published should be the date the song was published as a Date, required
 *
 * coverArt should be a url to the cover art of the song as a String, required
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
    } = req.body;
    if (
      !artist ||
      !genre ||
      !title ||
      !duration ||
      !explicit ||
      !description ||
      !published ||
      !coverArt
    ) {
      return res
        .status(400)
        .json({ result: null, message: "Invalid request inputs." });
    }
    const songToUpdate = await songModel.findById(songId).exec();
    if (!songToUpdate) {
      return res
        .status(400)
        .json({ result: null, message: `Invalid Song id ${songId}` });
    }

    // ensure user is admin or artist of song being edited
    const {user, roles} = req;
    if(!user || !roles) {
      return res.status(401).json({result: null, message: "Unauthorized"});
    }
    const User = userModel.findOne({username: user}).exec();
    if(!User) {
      return res.status(401).json({result: null, message: "Invalid user, unauthorized"});
    }
    if(!(await canAccess(user, roles, songId))) {
      return res.status(401).json({result: null, message: "Unauthorized, you may not edit this song"});
    }

    // if artist is different, remove song from old artist's songs and 
    // add to new artist's songs
    if (songToUpdate.artist.toString() !== artist) {
      const oldArtist = await artistModel.findById(songToUpdate.artist).exec();
      oldArtist.songs = oldArtist.songs.filter(song => song.toString() !== songId);
      await oldArtist.save();
      const newArtist = await artistModel.findById(artist).exec();
      newArtist.songs.unshift(songId);
      await newArtist.save();
    }

    // if genre is different, remove song from old genre's songs and 
    // add to new genre's songs
    if (songToUpdate.genre.toString() !== genre) {
      const oldGenre = await genreModel.findById(songToUpdate.genre).exec();
      oldGenre.songs = oldGenre.songs.filter(song => song.toString() !== songId);
      await oldGenre.save();
      const newGenre = await genreModel.findById(genre).exec();
      newGenre.songs.unshift(songId);
      await newGenre.save();
    }

    // update songToUpdate
    songToUpdate.artist = artist;
    songToUpdate.genre = genre;
    songToUpdate.title = title;
    songToUpdate.duration = duration;
    songToUpdate.explicit = explicit;
    songToUpdate.license = license;
    songToUpdate.description = description;
    songToUpdate.published = published;
    songToUpdate.coverArt = coverArt;
    const updatedSong = await songToUpdate.save();

    return res.status(200).json({ result: updatedSong, message: "Success" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ result: null, message: "Error updating Song" });
  }
};

/**
 * Takes request with songId and values for
 * likes, shares, purchases, and streams that will be
 * added to the song's current values. Returns the updated
 * song object.
 *
 * Expects:
 * ```json
 * {
 *  "songId": String,
 *  "likes": Number,
 *  "shares": Number,
 *  "purchases": Number,
 *  "streams": Number
 * }
 * ```
 * 
 * songId should be the object id of the song to update as a String, required
 * 
 * likes should be the number of likes to increment by for the song as a Number, required
 * 
 * shares should be the number of shares to increment by for the song as a Number, required
 * 
 * purchases should be the number of purchases to increment by for the song as a Number, required
 * 
 * streams should be the number of streams to increment by for the song as a Number, required
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and updated genre
 */
const updateSongProperties = async (req, res) => {
  const { user, roles } = req;
  const { songId } = req.body;
  let {
    likes,
    shares,
    purchases,
    streams,
  } = req.body;
  if(!user || !roles) {
    return res.status(401).json({result: null, message: "Unauthorized"});
  }
  if (!songId || (!likes && !shares && !purchases && !streams)) {
    return res.status(400).json({ result: null, message: "Invalid request inputs." });
  }
  if(!likes) likes = 0;
  if(!shares) shares = 0;
  if(!purchases) purchases = 0;
  if(!streams) streams = 0;

  if(likes < 0 || shares < 0 || purchases < 0 || streams < 0) {
    return res.status(400).json({ result: null, message: "Invalid request inputs. Negative values not allowed." });
  }
  if(likes > 100 || shares > 100 || purchases > 100 || streams > 100) {
    return res.status(400).json({ result: null, message: "Invalid request inputs. Too many increments!" });
  }

  try {
    const songToUpdate = await songModel.findById(songId).exec();
    if (!songToUpdate) {
      return res
        .status(400)
        .json({ result: null, message: `Invalid Song id ${id}` });
    }
    if (!(await canAccess(user, roles, songId))) {
      return res.status(403).json({ result: null, message: "Unauthorized" });
    }
    songToUpdate.likes += likes;
    songToUpdate.shares += shares;
    songToUpdate.purchases += purchases;
    songToUpdate.streams += streams;
    const updatedSong = await songToUpdate.save();

    return res.status(200).json({ result: updatedSong, message: "Success" });
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
 * { "songId": String }
 * ```
 * songId is required, with id being the object id of the Song to delete in String format
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message
 */
const deleteSong = async (req, res) => {
  try {
    const { songId } = req.body;
    if (!songId) {
      return res
        .status(400)
        .json({ result: null, message: "Song id is required" });
    }
    const songToDelete = await songModel.findById(songId).exec();
    if (!songToDelete) {
      return res
        .status(400)
        .json({ result: null, message: `Invalid Song id ${songId}` });
    }

    // remove from artist's songs
    const artist = await artistModel.findById(songToDelete.artist).exec();
    artist.songs = artist.songs.filter((song) => song != songId);
    await artist.save();

    // remove from genre's songs
    const genre = await genreModel.findById(songToDelete.genre).exec();
    genre.songs = genre.songs.filter((song) => song != songId);
    await genre.save();

    // TODO: remove from album's songs and delete formats and other files

    await songModel.findByIdAndDelete(songId).exec();
    return res.status(200).json({ result: null, message: "Success" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ result: null, message: "Error deleting Song" });
  }
};

/**
 * Checks if a user can access a song to modify it
 * 
 * @param {String} username username of the user trying to access this resource
 * @param {[String]} roles roles of the user trying to access this resource
 * @param {String} songId id of the song to access
 * @returns {Boolean} true if the user can access the song, false otherwise
 */
const canAccess = async (username, roles, songId) => {
  if (!username || !roles || !songId) {
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
