const express = require("express");
const router = express.Router();
const { logout } = require("../controllers/LogoutController");

router.get("/", logout);

module.exports = router;
