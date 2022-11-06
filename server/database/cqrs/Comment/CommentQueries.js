const { commentModel } = require("../../schemas/Comment");

const getAllComments = () => {
  return commentModel.find({});
};

const getSpecificComments = (options) => {
  return commentModel.find(options);
};

module.exports = {
  getAllComments,
  getSpecificComments,
};
