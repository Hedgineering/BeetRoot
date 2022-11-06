const { playlistModel } = require("../../schemas/Playlist");

const getAllPlaylists = () => {
  return playlistModel.find({});
};

const getSpecificPlaylists = (options) => {
  return playlistModel.find(options);
};

module.exports = {
  getAllPlaylists,
  getSpecificPlaylists,
};
