const { listedSongModel } = require("../../schemas/ListedSong");

const getAllListedSongs = () => {
  return listedSongModel.find({});
};

const getSpecificListedSongs = (options) => {
  return listedSongModel.find(options);
};

module.exports = {
  getAllListedSongs,
  getSpecificListedSongs,
};
