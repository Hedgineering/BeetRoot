const { userModel } = require("../../../schemas/User");

const getAllUsers = () => {
  return userModel.find({});
};

const getSpecificUsers = (options) => {
  return userModel.find(options);
};

module.exports = {
  getAllUsers,
  getSpecificUsers,
};
