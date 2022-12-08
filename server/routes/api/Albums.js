const verifyRoles = require('../../middleware/VerifyRoles');
const ROLES_LIST = require('../../config/RolesList');
const express = require("express");
const router = express.Router();
const { 
  getAlbums, 
  getAlbum, 
  createAlbum, 
  updateAlbum, 
  addSongsToAlbum,
  deleteAlbum 
} = require("../../controllers/AlbumController");

router.route("/")
  .get(getAlbums)
  .post(verifyRoles(ROLES_LIST.ADMIN, ROLES_LIST.ARTIST), createAlbum)
  .put(verifyRoles(ROLES_LIST.ADMIN), updateAlbum)
  .patch(verifyRoles(ROLES_LIST.ADMIN, ROLES_LIST.ARTIST), addSongsToAlbum)
  .delete(verifyRoles(ROLES_LIST.ADMIN), deleteAlbum);

router.route("/:id")
  .get(getAlbum);

module.exports = router;