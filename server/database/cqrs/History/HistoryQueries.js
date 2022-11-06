const { historyModel } = require("../../../schemas/History");

const getAllHistories = () => {
  return historyModel.find({});
};

const getSpecificHistories = (options) => {
  return historyModel.find(options);
};

module.exports = {
  getAllHistories,
  getSpecificHistories,
};
