const verifyRoles = require('../../middleware/VerifyRoles');
const ROLES_LIST = require('../../config/RolesList');
const express = require("express");
const router = express.Router();
const { 
  getArtists, 
  getArtist, 
  createArtist, 
  updateArtist, 
  addSongToArtist,
  deleteSongFromArtist,
} = require("../../controllers/ArtistController");

router.route("/")
  .get(getArtists)
  .post(verifyRoles(ROLES_LIST.ADMIN, ROLES_LIST.ARTIST), createArtist)
  .put(verifyRoles(ROLES_LIST.ADMIN, ROLES_LIST.ARTIST), updateArtist)
  .patch(verifyRoles(ROLES_LIST.ADMIN, ROLES_LIST.ARTIST), addSongToArtist)
  .delete(verifyRoles(ROLES_LIST.ADMIN, ROLES_LIST.ARTIST), deleteSongFromArtist);

router.route("/:id")
  .get(getArtist);

module.exports = router;