"use strict";

// =========================
// Get Environment Variables
// =========================
const path = require("path");
const rootDir = path.resolve(__dirname, ".");
const env = require("dotenv").config({ path: `${rootDir}/.env` }).parsed;

if (!env) {
  console.log("Environment variables file not found");
}

// ==========================
// General Require Statements
// ==========================
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {userModel} = require("../database/schemas/User");
const {roleModel} = require("../database/schemas/Role");

// ====================================
// Endpoints for Registration and Login
// ====================================
const register = (req, res) => {
};

module.exports = {
  publish,
};
