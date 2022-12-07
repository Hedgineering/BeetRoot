const verifyRoles = require('../../middleware/VerifyRoles');
const ROLES_LIST = require('../../config/RolesList');
const express = require("express");
const router = express.Router();
const { 
  getHistories, 
  getHistory, 
  createHistory, 
  updateHistory, 
  addStreamToHistory,
  deleteStreamFromHistory
} = require("../../controllers/HistoryController");

router.route("/")
  .get(verifyRoles(ROLES_LIST.ADMIN), getHistories)
  .post(createHistory)
  .put(updateHistory)
  .patch(addStreamToHistory)
  .delete(deleteStreamFromHistory);

router.route("/:id")
  .get(getHistory);

module.exports = router;