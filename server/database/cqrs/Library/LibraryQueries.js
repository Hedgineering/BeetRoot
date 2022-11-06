const { libraryModel } = require("../../schemas/Library");

const getAllLibraries = () => {
  return libraryModel.find({});
};

const getSpecificLibraries = (options) => {
  return libraryModel.find(options);
};

module.exports = {
  getAllLibraries,
  getSpecificLibraries,
};
