const verifyRoles = require('../../middleware/VerifyRoles');
const ROLES_LIST = require('../../config/RolesList');
const express = require("express");
const router = express.Router();
const { 
  getSongs, 
  getSong, 
  createSong, 
  updateSong, 
  updateSongProperties,
  deleteSong 
} = require("../../controllers/SongController.js");

router.route("/")
  .get(getSongs)
  .post(verifyRoles(ROLES_LIST.ADMIN, ROLES_LIST.ARTIST), createSong)
  .put(verifyRoles(ROLES_LIST.ADMIN, ROLES_LIST.ARTIST), updateSong)
  .patch(verifyRoles(ROLES_LIST.ADMIN, ROLES_LIST.ARTIST), updateSongProperties)
  .delete(verifyRoles(ROLES_LIST.ADMIN, ROLES_LIST.ARTIST), deleteSong);

router.route("/:id")
  .get(getSong);

module.exports = router;