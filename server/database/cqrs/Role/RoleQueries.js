const { roleModel } = require("../../../schemas/Role");

const getAllRoles = () => {
  return roleModel.find({});
};

const getSpecificRoles = (options) => {
  return roleModel.find(options);
};

module.exports = {
  getAllRoles,
  getSpecificRoles,
};
