const express = require('express');
const router = express.Router();
const { register } = require('../controllers/AuthController');

router.post('/', register);

module.exports = router;