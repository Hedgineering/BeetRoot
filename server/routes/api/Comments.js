const express = require("express");
const router = express.Router();
const {
  postComment,
  getComment,
  getComments,
  updateComment,
  deleteComment,
  updateCommentState,
} = require("../../controllers/CommentController");

router
  .route("/")
  .get(getComments)
  .put(updateComment)
  .patch(updateCommentState)
  .delete(deleteComment);

router.route("/:id").post(postComment).get(getComment);

module.exports = router;
