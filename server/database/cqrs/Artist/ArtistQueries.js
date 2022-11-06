const { artistModel } = require("../../schemas/Artist");

const getAllArtists = () => {
  return artistModel.find({});
};

const getSpecificArtists = (options) => {
  return artistModel.find(options);
};

module.exports = {
  getAllArtists,
  getSpecificArtists,
};
