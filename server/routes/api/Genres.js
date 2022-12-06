const verifyRoles = require('../../middleware/VerifyRoles');
const ROLES_LIST = require('../../config/RolesList');
const express = require("express");
const router = express.Router();
const { 
  getGenres, 
  getGenre, 
  createGenre, 
  updateGenre, 
  addSongsToGenre,
  deleteGenre 
} = require("../../controllers/GenreController");

router.route("/")
  .get(getGenres)
  .post(verifyRoles(ROLES_LIST.ADMIN, ROLES_LIST.ARTIST), createGenre)
  .put(verifyRoles(ROLES_LIST.ADMIN), updateGenre)
  .patch(verifyRoles(ROLES_LIST.ADMIN, ROLES_LIST.ARTIST), addSongsToGenre)
  .delete(verifyRoles(ROLES_LIST.ADMIN), deleteGenre);

router.route("/:id")
  .get(getGenre);

module.exports = router;