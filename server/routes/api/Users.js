const verifyRoles = require("../../middleware/VerifyRoles");
const ROLES_LIST = require("../../config/RolesList");
const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateUserProperties,
  deleteUser,
} = require("../../controllers/UserController");


/**
 * For update user, check if you are correct user
 * check if admin is in req.roles
 * For delete/put/patch, check if either you are correct user, in which case you can only update yourself, but if you are admin, you can perform the action on anyone.
 **/
router
  .route("/")
  .get(verifyRoles(ROLES_LIST.ADMIN), getUsers)
  .post(verifyRoles(ROLES_LIST.ADMIN), createUser)
  .put(updateUser)
  .patch(updateUserProperties)
  .delete(deleteUser);

router.route("/:id").get(getUser);

module.exports = router;
