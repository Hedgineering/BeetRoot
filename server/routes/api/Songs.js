const verifyRoles = require('../../middleware/VerifyRoles');
const ROLES_LIST = require('../../config/RolesList');
const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");

const filesPayloadExists = require("../../middleware/FilesPayloadExists");
const fileExtLimiter = require("../../middleware/FileExtLimiter");
const fileSizeLimiter = require("../../middleware/FileSizeLimiter");
const { 
  getSongs, 
  getSong, 
  createSong, 
  createSongAndDependencies,
  updateSong, 
  updateSongProperties,
  deleteSong 
} = require("../../controllers/SongController.js");

router.route("/")
  .get(getSongs)
  .post(verifyRoles(ROLES_LIST.ADMIN, ROLES_LIST.ARTIST), createSong)
  .put(verifyRoles(ROLES_LIST.ADMIN, ROLES_LIST.ARTIST), updateSong)
  .patch(updateSongProperties)
  .delete(verifyRoles(ROLES_LIST.ADMIN, ROLES_LIST.ARTIST), deleteSong);

router.route("/forcecreate")
  .post(
    verifyRoles(ROLES_LIST.ADMIN, ROLES_LIST.ARTIST),
    fileUpload({ createParentPath: true }),
    filesPayloadExists,
    fileExtLimiter([".mp3", ".wav", ".png", ".jpg", ".jpeg"]),
    fileSizeLimiter,
    createSongAndDependencies
  );

router.route("/:id")
  .get(getSong);

module.exports = router;