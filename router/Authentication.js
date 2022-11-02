const express = require('express')
const router = express.Router()

const authController = require('../controllers/AuthController.js')

router.post('/register', authController.register)
module.exports = router