const mongoose = require("mongoose");
const { genreModel } = require("../models/Genre");
const { songModel } = require("../models/Song");

/**
 * Gets list of existing genres
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and list of genres
 */
const getGenres = async (req, res) => {
  try {
    const genres = await genreModel.find({}).exec();
    return res.status(200).json({ result: genres, message: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ result: [], message: "Error getting genres" });
  }
};

/**
 * Takes request with genre id and returns genre object if it exists, null otherwise
 * Expects genre id as url parameter:
 * 
 * Ex: www.beetroot.com/api/genre/5f9f1b9f9f1b9f1b9f1b9f1b
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and queried genre
 */
const getGenre = async (req, res) => {
  try {
    const genre = await genreModel.findById(req.params.id).exec();
    return res.status(200).json({ result: genre, message: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ result: null, message: "Error getting genre" });
  }
};

/**
 * Takes request with genre name and returns genre object created
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
const createGenre = async (req, res) => {
  try {
    let { name, songs } = req.body;
    console.log(req.body)
    console.log(req)
    if(!name) {
      return res.status(400).json({ result: null, message: "Genre name is required" });
    }
    if(!songs) { songs = []; }
    else {
      // check to make sure each element in songs is a valid song id
      for(let i = 0; i < songs.length; i++) {
        const song = await songModel.findById(songs[i]).exec();
        if(!song) {
          return res.status(400).json({ result: null, message: `Invalid song id ${songs[i]}` });
        }
      }
    }
    const genre = await genreModel.create({ name, songs });
    return res.status(200).json({ result: genre, message: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ result: null, message: "Error creating genre" });
  }
};

/**
 * Takes request with genre name and returns genre object updated as result
 * Replaces existing genre with new genre created with passed name and songs
 * 
 * Expects:
 * ```json
 * { "id": String, "name": String, "songs": [String] }
 * ```
 * id and name are required, with id being the object id of the genre to update in String format
 * 
 * songs should be an array of song ids in String format, can be empty
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and updated genre
 */
const updateGenre = async (req, res) => {
  try {
    let { id, name, songs } = req.body;
    if(!id || !name) {
      return res.status(400).json({ result: null, message: "Genre name and id is required" });
    }
    const genreToUpdate = await genreModel.findById(id).exec();
    if(!genreToUpdate) {
      return res.status(400).json({ result: null, message: `Invalid genre id ${id}` });
    }
    if(!songs) { songs = []; }
    else {
      // check to make sure each element in songs is a valid song id
      for(let i = 0; i < songs.length; i++) {
        const song = await songModel.findById(songs[i]).exec();
        if(!song) {
          return res.status(400).json({ result: null, message: `Invalid song id ${songs[i]}` });
        }
      }
    }

    const newGenre = await genreModel.findByIdAndUpdate(id, 
      { name, songs }, 
      { new: true }
    ).exec();

    return res.status(200).json({ result: newGenre, message: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ result: null, message: "Error updating genre" });
  }
}

/**
 * Takes request with genre id and songs to insert and returns genre object updated
 * 
 * Expects:
 * ```json
 * { "id": String, "songs": [String] }
 * ```
 * id is required, with id being the object id of the genre to update in String format
 * 
 * songs is required, with songs being an array of song ids in String format
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and updated genre
 */
const addSongsToGenre = async (req, res) => {
  try {
    const { id, songs } = req.body;
    if(!id || !songs) {
      return res.status(400).json({ result: null, message: "Genre id and songs are required" });
    }
    const genreToUpdate = await genreModel.findById(id).exec();
    if(!genreToUpdate) {
      return res.status(400).json({ result: null, message: `Invalid genre id ${id}` });
    }
    const containedSongs = new Set(genreToUpdate.songs.map(song => song.toString()));
    // check to make sure each element in songs is a valid song id
    for(let i = 0; i < songs.length; i++) {
      const song = await songModel.findById(songs[i]).exec();
      if(!song) {
        return res.status(400).json({ result: null, message: `Invalid song id ${songs[i]}` });
      }
      if(containedSongs.has(songs[i])) {
        return res.status(400).json({ result: null, message: `Song ${songs[i]} already in genre` });
      }
    }

    // push each element in songs to genreToUpdate.songs
    let updatedGenre = await genreModel.findByIdAndUpdate(
      id, 
      { $push: { songs: { $each: songs } } }
    ).exec();
    updatedGenre = await genreModel.findById(id).exec();
    return res.status(200).json({ result: updatedGenre, message: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ result: null, message: "Error adding songs to genre" });
  }
};


/**
 * Takes request with genre id of genre to delete
 * 
 * Expects:
 * ```json
 * { "id": String }
 * ```
 * id is required, with id being the object id of the genre to delete in String format
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message
 */
const deleteGenre = async (req, res) => {
  try {
    const { id } = req.body;
    if(!id) {
      return res.status(400).json({ result: null, message: "Genre id is required" });
    }
    const genreToDelete = await genreModel.findById(id).exec();
    if(!genreToDelete) {
      return res.status(400).json({ result: null, message: `Invalid genre id ${id}` });
    }
    await genreModel.findByIdAndDelete(id).exec();
    return res.status(200).json({ result: null, message: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ result: null, message: "Error deleting genre" });
  }
};

module.exports = {
  getGenres,
  getGenre,
  createGenre,
  updateGenre,
  addSongsToGenre,
  deleteGenre
};