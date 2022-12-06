const express = require("express");
const router = express.Router();
const { postComment } = require("../../controllers/CommentController");

router.post("/:id", postComment);

module.exports = router;