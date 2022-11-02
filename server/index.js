// =========================
// Pre-Config for .env file
// =========================
const path = require("path");
const rootDir = path.resolve(__dirname, ".");
const env = require("dotenv").config({ path: `${rootDir}/.env` }).parsed;

if (!env) {
  console.log("Environment variables file not found");
}

const server_port = process.env.PORT || env["PORT"] || 5000;

// if .env file loaded properly, this should print 3000, else it will print 5000
console.log(`Server configured for port ${server_port}`);

// ==========================
// General Require Statements
// ==========================
const express = require("express");
const authController = require("./controllers/AuthController");

const app = express();

// =================================
// Configure Express Endpoints Here
// =================================

// POST for registration and login
app.post("/register", authController.register);
app.post("/login", authController.login);

// GET for root directory (default)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// This comes at the end as this starts the server
app.listen(server_port, () => {
  console.log(`Server listening on port ${server_port}`);
});
