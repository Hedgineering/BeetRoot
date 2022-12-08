const ROLES_LIST = require("../config/RolesList");
const { artistModel } = require("../models/Artist");
const { userModel } = require("../models/User");
const { genreModel } = require("../models/Genre");
const { songModel } = require("../models/Song");

/**
 * Gets list of existing Artists
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and list of Artists
 */
const getArtists = async (req, res) => {
  try {
    const artists = await artistModel.find({}).exec();
    if (!artists || artists.length === 0) {
      res.status(404).json({ result: [], message: "No artists found" });
    }
    res.status(200).json({ result: artists, message: "Artists found" });
  } catch (error) {
    res.status(500).json({ result: null, message: "Error finding artists" });
  }
};

/**
 * Takes request with artist id and returns artist object if it exists, null otherwise
 * Expects artist id as url parameter:
 *
 * Ex: www.beetroot.com/api/artist/5f9f1b9f9f1b9f1b9f1b9f1b
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and queried artist
 */
const getArtist = async (req, res) => {
  const artistId = req.params.id;
  if (!artistId) {
    res.status(400).json({ result: null, message: "Artist id not provided" });
  }

  try {
    const artist = await artistModel.findById(artistId).exec();
    if (!artist) {
      res.status(404).json({ result: null, message: "Artist not found" });
    }
    res.status(200).json({ result: artist, message: "Artist found" });
  } catch (error) {
    res.status(500).json({ result: null, message: "Error finding artist" });
  }
};

/**
 * Takes request with desired artist username, user id, and genre id
 * and creates artist object. Admins may create artist objects for other users,
 * but artists may only create artist objects for themselves.
 *
 * Expects:
 * ```json
 * { "username": String, "userId": String, "genreId": String}
 * ```
 *
 * username should be a String, required
 *
 * userId should be a user object id in String format, required
 *
 * genreId should be a genre object id in String format, required
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and created artist object
 */
const createArtist = async (req, res) => {
  const { username, userId, genreId } = req.body;
  const { user, roles } = req;
  if (!username || !userId || !genreId || !user || !roles) {
    res.status(400).json({ result: null, message: "Missing required fields" });
  }
  if (!(await allowedAccess(user, roles, userId))) {
    res.status(403).json({ result: null, message: "User not authorized" });
  }

  // ensure genre exists in database
  const genre = await genreModel.findById(genreId).exec();
  if (!genre) {
    return res
      .status(404)
      .json({ result: null, message: `Genre ${genreId} not found` });
  }

  try {
    const createdArtist = await artistModel.create({
      username,
      user: userId,
      genre: genreId,
      songs: [],
    });
    return res
      .status(201)
      .json({ result: createdArtist, message: "Artist created" });
  } catch (error) {
    return res
      .status(500)
      .json({ result: null, message: "Error creating artist" });
  }
};

/**
 * Takes request with artistId, username, userId, genre and songs,
 * and returns artist object updated as result.
 * Replaces existing artist with new artist created with passed parameters.
 *
 * Expects:
 * ```json
 * { "artistId": String, "username": String, "userId": String, "genreId": String, "songs": [String] }
 * ```
 *
 * artistId should be a artist object id in String format, required
 *
 * username should be a String, required
 *
 * userId should be a user object id in String format, required
 *
 * genreId should be a genre object id in String format, required
 *
 * songs should be an array of song object ids in String format, can be empty array, required
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and updated artist
 */
const updateArtist = async (req, res) => {
  const { artistId, username, userId, genreId, songs } = req.body;
  const { user, roles } = req;

  try {
    const artist = await artistModel.findById(artistId).exec();
    if (!artist) {
      return res
        .status(404)
        .json({ result: null, message: "Artist not found" });
    }
    if (!(await allowedAccess(user, roles, artist.user))) {
      return res
        .status(403)
        .json({ result: null, message: "User not authorized" });
    }

    // ensure genre exists in database
    const genre = await genreModel.findById(genreId).exec();
    if (!genre) {
      return res
        .status(404)
        .json({ result: null, message: `Genre ${genreId} not found` });
    }

    // ensure songs exist in database
    for (let i = 0; i < songs.length; i++) {
      const song = await songModel.findById(songs[i]).exec();
      if (!song) {
        return res
          .status(404)
          .json({ result: null, message: `Song ${songs[i]} not found` });
      }
    }

    const updatedArtist = await artistModel
      .findByIdAndUpdate(
        artistId,
        {
          username,
          user: userId,
          genre: genreId,
          songs,
        },
        { new: true }
      )
      .exec();
    return res
      .status(200)
      .json({ result: updatedArtist, message: "Artist updated" });
  } catch (error) {
    return res
      .status(500)
      .json({ result: null, message: "Error updating artist" });
  }
};

/**
 * Takes request with artistId and song, and returns artist object updated as result
 * Adds song to artist object with artistId passed in. 
 * 
 * Expects:
 * ```json
 * { "artistId": String, "song": String }
 * ```
 * 
 * artistId should be a artist object id in String format, required
 * 
 * song should be a song object id in String format, required
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns artist object with updated songs array
 */
const addSongToArtist = async (req, res) => {
  const { artistId, song } = req.body;
  const { user, roles } = req;

  try {
    const artist = await artistModel.findById(artistId).exec();
    if (!artist) {
      return res.status(404).json({ result: null, message: "Artist not found" });
    }
    if (!(await allowedAccess(user, roles, artist.user))) {
      return res.status(403).json({ result: null, message: "User not authorized" });
    }
    const songObj = await songModel.findById(song).exec();
    if (!songObj) {
      return res.status(404).json({ result: null, message: `Song ${song} not found` });
    }

    // add song to front of artist's songs array
    artist.songs.unshift(song);
    const updatedArtist = await artist.save();
    return res.status(200).json({ result: updatedArtist, message: "Song added to artist" });

  } catch (error) {
    return res.status(500).json({ result: null, message: "Error finding artist" });
  }
};

/**
 * Deletes song from songs array of artist with artistId passed in request
 * 
 * Expects:
 * ```json
 * { "artistId": String, "song": String }
 * ```
 * 
 * artistId should be a artist object id in String format, required
 * 
 * song should be a song object id in String format, required
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and updated artist
 */
const deleteSongFromArtist = async (req, res) => {
  const { artistId, song } = req.body;
  const { user, roles } = req;

  try {
    const artist = await artistModel.findById(artistId).exec();
    if (!artist) {
      return res.status(404).json({ result: null, message: "Artist not found" });
    }
    if (!(await allowedAccess(user, roles, artist.user))) {
      return res.status(403).json({ result: null, message: "User not authorized" });
    }
    const songObj = await songModel.findById(song).exec();
    if (!songObj) {
      return res.status(404).json({ result: null, message: `Song ${song} not found` });
    }

    // remove song from artist's songs array
    artist.songs = artist.songs.filter((s) => s !== song);
    const updatedArtist = await artist.save();
    return res.status(200).json({ result: updatedArtist, message: "Song deleted from artist" });
  } catch (error) {
    return res.status(500).json({ result: null, message: "Error finding artist" });
  }
};

/**
 * Allows user to access artist object if they are admin or owner of the artist object
 *
 * @param {String} username username of the current user tryting to access resource
 * @param {String[]} roles roles of the current user tryting to access resource
 * @param {String} artistUserId object id of the artist resource in string format
 * @returns {Boolean} true if user has access to the resource, false otherwise
 */
const allowedAccess = (username, roles, artistUserId) => {
  if (!artistUserId || !username) {
    return false;
  }
  try {
    const currentUser = userModel.findOne({ username }).exec();
    if (!currentUser) {
      return false;
    }
    if (!roles.includes(ROLES_LIST.ADMIN) && currentUser._id != artistUserId) {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
};

module.exports = {
  getArtists,
  getArtist,
  createArtist,
  updateArtist,
  addSongToArtist,
  deleteSongFromArtist,
};
