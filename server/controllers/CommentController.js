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
const jwt = require("jsonwebtoken");
const {userModel} = require("../database/schemas/User");
const {commentModel} = require("../database/schemas/Comment");

// ==============================
// Endpoints for Posting Comments
// ==============================
