const mongoose = require("mongoose");
const { userModel } = require("../models/User");
const { artistModel } = require("../models/Artist");

/**
 * Gets list of existing Artists
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and list of Artists
 */
const getArtists = async (req, res) => {
  try {
    const Artists = await artistModel.find({}).exec();
    return res.status(200).json({ result: Artists, message: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ result: [], message: "Error getting Artists" });
  }
};

/**
 * Takes request with Artist id and returns Artist object if it exists, null otherwise
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and queried Artist
 */
const getArtist = async (req, res) => {
  try {
    const Artist = await artistModel.findById(req.params.id).exec();
    return res.status(200).json({ result: Artist, message: "Success" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ result: null, message: "Error getting Artist" });
  }
};

/**
 * Takes request with Artist username,Artist user field, Artist genre, and Artist songs and returns Artist object created
 *
 * Expects:
 * ```json
 * { "username": String, "user": mongoose.SchemaTypes.ObjectId, "genre": mongoose.SchemaTypes.ObjectId,"songs":[{ type: mongoose.SchemaTypes.ObjectId, ref: "Song" }]}
 * ```
 * username should be a string, user should have an object id of user,genre should have an object id of genre,Songs should be an array of objects with object id of song, all are required
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and created Artist
 */
const createArtist = async (req, res) => {
  try {
    let { username,user,genre,songs } = req.body;
    if (!username || !user ||!genre ||!songs) {
      return res
        .status(400)
        .json({
          result: null,
          message: "Artist username,Artist user field, Artist genre, and Artist songs  are required",
        });
    }
    const Artist = await artistModel.create({ username,user,genre,songs});
    return res.status(200).json({ result: Artist, message: "Success" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ result: null, message: "Error creating Artist" });
  }
};

/**
 * Takes request with Artist username,Artist user field, Artist genre, and Artist songs 
 * returns Artist object updated as result.
 *
 * Replaces existing Artist with new Artist created with passed Takes request with Artist username,Artist user field, Artist genre, and Artist songs 
 *
 * Expects:
 * ```json
 * { "id":String, "username": String, "user": mongoose.SchemaTypes.ObjectId, "genre": mongoose.SchemaTypes.ObjectId,"songs":[{ type: mongoose.SchemaTypes.ObjectId, ref: "Song" }]}
 * ```
 * id should be an object id in String format, required
 *
 * username should be a string, user should have an object id of user,genre should have an object id of genre,Songs should be an array of objects with object id of song, all are required
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and updated Artist
 */
const updateArtist = async (req, res) => {
  try {
    let { id, username,user,genre,songs } = req.body;
    if (!username || !user ||!genre ||!songs) {
      return res
        .status(400)
        .json({
          result: null,
          message: "Artist username,Artist user field, Artist genre, and Artist songs  are required",
        });
    }
    const ArtistToUpdate = await artistModel.findById(id).exec();
    if (!ArtistToUpdate) {
      return res
        .status(400)
        .json({ result: null, message: `Invalid Artist id ${id}` });
    }
    const Artist = await artistModel
      .findByIdAndUpdate(id, { username,user,genre,songs }, { new: true })
      .exec();
    return res.status(200).json({ result: Artist, message: "Success" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ result: null, message: "Error updating Artist" });
  }
};

/**
 * Takes request with Artist name and
 * returns json object with message of success or failure
 * Applies Artist to all users corresponding to passed usernames
 *
 * Expects:
 * ```json
 * { "id": String, "usernames": [String] }
 * ```
 * id should be an object id for the Artist to be applied in String format, required
 *
 * usernames should be an array of strings, required
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and updated genre
 */
const addUsersToArtist = async (req, res) => {
  try {
    let { id, usernames } = req.body;
    if (!id || !usernames) {
      return res
        .status(400)
        .json({ result: null, message: "Artist id and usernames are required" });
    }
    // ensure Artist exists
    const Artist = await artistModel.findById(id).exec();
    if (!Artist) {
      return res
        .status(400)
        .json({ result: null, message: `Invalid Artist id ${id}` });
    }
    // ensure users exist and add Artist if they do
    for (let i = 0; i < usernames.length; i++) {
      const user = await userModel.findOne({ username: usernames[i] }).exec();
      if (!user) {
        return res
          .status(400)
          .json({ result: null, message: `Invalid username ${usernames[i]}` });
      }
      user.Artists.push(Artist._id);
      await user.save();
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ result: null, message: "Error adding users to Artist" });
  }
};

/**
 * Takes request with Artist id of Artist to delete
 *
 * Expects:
 * ```json
 * { "id": String }
 * ```
 * id is required, with id being the object id of the Artist to delete in String format
 *
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message
 */
const deleteArtist = async (req, res) => {
  try {
    let { id } = req.body;
    if (!id) {
      return res
        .status(400)
        .json({ result: null, message: "Artist id is required" });
    }
    // ensure Artist exists
    const Artist = await artistModel.findById(id).exec();
    if (!Artist) {
      return res
        .status(400)
        .json({ result: null, message: `Invalid Artist id ${id}` });
    }
    // remove Artist from all users with Artist in Artists array
    await userModel.updateMany({ Artists: id }, { $pull: { Artists: id } }).exec();
    // delete Artist
    await ArtistModel.findByIdAndDelete(id).exec();
    return res.status(200).json({ result: null, message: "Success" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ result: null, message: "Error deleting Artist" });
  }
};

module.exports = {
  getArtists,
  getArtist,
  createArtist,
  updateArtist,
  addUsersToArtist,
  deleteArtist,
};
