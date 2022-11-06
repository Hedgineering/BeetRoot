const { songModel } = require("../../../schemas/Song");

const getAllSongs = () => {
  return songModel.find({});
};

const getSpecificSongs = (options) => {
  return songModel.find(options);
};

module.exports = {
  getAllSongs,
  getSpecificSongs,
};
