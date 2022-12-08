const verifyRoles = require('../../middleware/VerifyRoles');
const ROLES_LIST = require('../../config/RolesList');
const express = require("express");
const router = express.Router();
const { 
  getArtists, 
  getArtist, 
  createArtist, 
  updateArtist, 
  addUsersToArtist,
  deleteArtist
} = require("../../controllers/ArtistController");

router.route("/")
  .get(getArtists)
  .post(verifyRoles(ROLES_LIST.ADMIN), createArtist)
  .put(verifyRoles(ROLES_LIST.ADMIN), updateArtist)
  .patch(verifyRoles(ROLES_LIST.ADMIN), addUsersToArtist)
  .delete(verifyRoles(ROLES_LIST.ADMIN), deleteArtist);

router.route("/:id")
  .get(getArtist);

module.exports = router;