const mongoose = require("mongoose");
const ROLES_LIST = require("../config/RolesList");
const { historyModel } = require("../models/History");
const { userModel } = require("../models/User");
const { songModel } = require("../models/Song");

/**
 * Gets list of existing histories
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and list of histories
 */
const getHistories = async (req, res) => {
  try {
    const histories = await historyModel.find({}).exec();
    return res.status(200).json({ result: histories, message: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ result: [], message: "Error getting histories" });
  }
};

/**
 * Takes request with history id and returns history object if it exists, null otherwise
 * Expects history id as url parameter:
 * 
 * Ex: www.beetroot.com/api/history/5f9f1b9f9f1b9f1b9f1b9f1b
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and queried genre
 */
const getHistory = async (req, res) => {
  try {
    const { user, roles } = req;
    if(!req.params.id || !(await allowedAccess(user, roles, req.params.id))) {
      return res.status(403).json({ result: null, message: "Access denied" });
    }

    const history = await historyModel.findById(req.params.id).exec();
    return res.status(200).json({ result: history, message: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ result: null, message: "Error getting history" });
  }
};

/**
 * Takes request with user id the history is being made for and returns 
 * history object created. Only allows creation if history for that user
 * does not already exist.
 * 
 * Expects:
 * ```json
 * { "userId": String }
 * ```
 * userId should be a user id in String format
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and created history
 */
const createHistory = async (req, res) => {
  const { user, roles } = req;
  const { userId } = req.body;
  if(!user || !roles || !userId) {
    return res.status(403).json({ result: null, message: "Access denied; Invalid Inputs." });
  }
  try {
    // Admins are allowed to create histories for any user
    // Users are only allowed to create histories for themselves
    const existingHistory = await historyModel.findOne({userId}).exec();
    if(existingHistory) {
      return res.status(403).json({ result: null, message: "History already exists for this user" });
    }

    const currentUser = await userModel.findOne({username: user}).exec();
    if(!currentUser) {
      return res.status(403).json({ result: null, message: "User does not exist" });
    }
    if(!roles.includes(ROLES_LIST.ADMIN) && currentUser._id != userId) {
      return res.status(403).json({ result: null, message: "Access denied; You may not create a history for another user." });
    }

    const newHistory = await historyModel.create({
      userId,
      streams: []
    });
    return res.status(200).json({ result: newHistory, message: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ result: null, message: "Error creating history" });
  }
};

/**
 * Takes request with userId and streams, and returns history object updated as result
 * Replaces existing history with new history created with passed userId and streams
 * 
 * Expects:
 * ```json
 * { "userId": String, "streams": [ { song: String, times_streamed: Number } ] }
 * ```
 * 
 * userId should be a user id in String format, required
 * 
 * streams should be an array of stream objects, can be empty
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and updated history
 */
const updateHistory = async (req, res) => {
  const { user, roles } = req;
  const { userId, streams } = req.body;
  if(!user || !roles || !userId || !streams) {
    return res.status(403).json({ result: null, message: "Access denied; Invalid Inputs." });
  }
  try {
    // Admins are allowed to update histories for any user
    // Users are only allowed to update histories for themselves
    const existingHistory = await historyModel.findOne({userId}).exec();
    if(!existingHistory) {
      return res.status(403).json({ result: null, message: "History does not exist for this user. Please create a history before updating it." });
    }
    if(!(await allowedAccess(user, roles, existingHistory._id))) {
      return res.status(403).json({ result: null, message: "Access denied; You may not update a history for another user." });
    }

    // make sure streams is an empty array or an array of objects
    // where each object has a song and times_streamed property
    const streamsIsEmptyArray = Array.isArray(streams) && streams.length == 0;
    const streamsIsNotValidArray = !Array.isArray(streams) || streams.some(stream => !stream.song || !stream.times_streamed);
    if(!streamsIsEmptyArray && streamsIsNotValidArray) {
      return res.status(403).json({ result: null, message: "Invalid streams input" });
    }

    const updatedHistory = await historyModel.findOneAndUpdate(
      { userId }, 
      { userId, streams }, 
      { new: true }
    ).exec();

    return res.status(200).json({ result: updatedHistory, message: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ result: null, message: "Error updating history" });
  }
};

/**
 * Takes request with userId and song, and returns history object updated as result
 * Adds song to history object with userId passed in request as a stream object { song: String, times_streamed: Number }
 * 
 * Expects:
 * ```json
 * { "userId": String, "song": String }
 * ```
 * 
 * userId should be a user id in String format, required
 * 
 * song should be a song id in String format, required
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns history object with updated streams
 */
const addStreamToHistory = async (req, res) => {
  const { user, roles } = req;
  const { userId, song } = req.body;

  if(!user || !roles || !userId || !song) {
    return res.status(403).json({ result: null, message: "Access denied; Invalid Inputs." });
  }
  try {
    // Admins are allowed to update histories for any user
    // Users are only allowed to update histories for themselves
    const existingHistory = await historyModel.findOne({userId}).exec();
    if(!existingHistory) {
      return res.status(403).json({ result: null, message: "History does not exist for this user. Please create a history before updating it." });
    }
    if(!(await allowedAccess(user, roles, existingHistory._id))) {
      return res.status(403).json({ result: null, message: "Access denied; You may not update a history for another user." });
    }
    
    const streamedSong = songModel.findById(song).exec();
    if(!streamedSong) {
      return res.status(403).json({ result: null, message: "Song does not exist" });
    }

    // check if song is already in history, if so increment stream count,
    // otherwise add song to history and move that song to the front of the array
    const songIndex = existingHistory.streams.findIndex(stream => stream.song == song);
    if(songIndex != -1) {
      existingHistory.streams[songIndex].times_streamed++;
      // move song to front of array
      const song = existingHistory.streams.splice(songIndex, 1);
      existingHistory.streams.unshift(song);
    } else {
      existingHistory.streams.unshift({ song, times_streamed: 1 });
    }
    existingHistory.save();
    return res.status(200).json({ result: existingHistory, message: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ result: null, message: "Error updating history" });
  }
};

/**
 * Deletes stream of song from history object with userId passed in request
 * 
 * Expects:
 * ```json
 * { "userId": String, "song": String }
 * ```
 * 
 * userId should be a user id in String format, required
 * 
 * song should be a song id in String format, required
 * 
 * @param {HttpRequest} req request object
 * @param {HttpResponse} res response object
 * @returns json object with message and updated history
 */
const deleteStreamFromHistory = async (req, res) => {
  const { user, roles } = req;
  const { userId, song } = req.body;

  if(!user || !roles || !userId || !song) {
    return res.status(403).json({ result: null, message: "Access denied; Invalid Inputs." });
  }
  try {
    // Admins are allowed to update histories for any user
    // Users are only allowed to update histories for themselves
    const existingHistory = await historyModel.findOne({userId}).exec();
    if(!existingHistory) {
      return res.status(403).json({ result: null, message: "History does not exist for this user. Please create a history before updating it." });
    }
    if(!(await allowedAccess(user, roles, existingHistory._id))) {
      return res.status(403).json({ result: null, message: "Access denied; You may not update a history for another user." });
    }

    // if song is in history streams, remove it
    const songIndex = existingHistory.streams.findIndex(stream => stream.song == song);
    if(songIndex != -1) {
      existingHistory.streams.splice(songIndex, 1);
    }
    existingHistory.save();
    return res.status(200).json({ result: existingHistory, message: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ result: null, message: "Error updating history" });
  }
};

/**
 * Allows user to access user if they are admin or owner of the history
 * 
 * @param {String} username username of the current user tryting to access resource
 * @param {String[]} roles roles of the current user tryting to access resource
 * @param {String} history object id of the history resource in string format
 * @returns {Boolean} true if user has access to the resource, false otherwise
 */
const allowedAccess = (username, roles, history) => {
  if(!history || !username) {
    return false;
  }
  try {
    const currentUser = userModel.findOne({username}).exec();
    const currrentHistory = historyModel.findById(history).exec();
    if(!currentUser || !currrentHistory) {
      return false;
    }
    if(!roles.includes(ROLES_LIST.ADMIN) && currentUser._id != currrentHistory.userId) {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
};

module.exports = { 
  getHistories, 
  getHistory, 
  createHistory, 
  updateHistory, 
  addStreamToHistory,
  deleteStreamFromHistory
};