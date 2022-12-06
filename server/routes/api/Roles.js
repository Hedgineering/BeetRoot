const verifyRoles = require('../../middleware/VerifyRoles');
const ROLES_LIST = require('../../config/RolesList');
const express = require("express");
const router = express.Router();
const { 
  getRoles, 
  getRole, 
  createRole, 
  updateRole, 
  addUsersToRole,
  deleteRole
} = require("../../controllers/RoleController");

router.route("/")
  .get(getRoles)
  .post(verifyRoles(ROLES_LIST.ADMIN), createRole)
  .put(verifyRoles(ROLES_LIST.ADMIN), updateRole)
  .patch(verifyRoles(ROLES_LIST.ADMIN), addUsersToRole)
  .delete(verifyRoles(ROLES_LIST.ADMIN), deleteRole);

router.route("/:id")
  .get(getRole);

module.exports = router;