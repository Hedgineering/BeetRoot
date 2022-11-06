const { genreModel } = require("../../schemas/Genre");

const getAllGenres = () => {
  return genreModel.find({});
};

const getSpecificGenres = (options) => {
  return genreModel.find(options);
};

module.exports = {
  getAllGenres,
  getSpecificGenres,
};
