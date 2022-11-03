// =========================
// Pre-Config for .env file
// =========================
const path = require("path");
const rootDir = path.resolve(__dirname, ".");
const env = require("dotenv").config({ path: `${rootDir}/.env` }).parsed;

if (!env) {
  console.log(env);
  console.log("Environment variables file not found");
}

const server_port = process.env.PORT || env["PORT"] || 5000;

// if .env file loaded properly, this should print 3000, else it will print 5000
console.log(`Server configured for port ${server_port}`);

// ==========================
// General Require Statements
// ==========================
const express = require("express");
const mongoose = require("mongoose");
const {roleModel} = require("./database/schemas/Role");
const {userModel} = require("./database/schemas/User");
const authController = require("./controllers/AuthController");

const app = express();
app.use(express.json());

// Set up default mongoose connection
const mongoConnectionUri = env["MONGO_URI_TEST"] || "mongodb://localhost/beetroot";
console.log(`Connecting to MongoDB at ${mongoConnectionUri}`);

const conn = mongoose 
  .connect(mongoConnectionUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(error => console.log(error));

const db = mongoose.connection;
// Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

try {
  // TODO: Add Seed Data to Database
  roleModel
    .find({})
    .then(async (roles) => {
      if (roles.length === 0) {
        console.log("No roles found in database. Adding roles to database.");
        await roleModel.create([
          { name: "Listener", clearanceLevel: 1 },
          { name: "Artist", clearanceLevel: 1 },
          { name: "Admin", clearanceLevel: 2 },
        ]);

        // Users have to be added after roles, as users have a reference to roles that's required in their schema
        userModel
          .find({})
          .then(async (users) => {
            if (users.length === 0) {
              console.log("No users found in database. Adding users to database.");
              const adminId = roleModel.findOne({ name: "Admin" }).then(async (admin) => {
                await userModel.create([
                  {
                    username: "admin",
                    firstName: "admin", 
                    lastName: "1", 
                    password: "beetrootadmin!", 
                    email: "admin@beetroot.com", 
                    status: "normal", 
                    roles: [admin._id] 
                  },
                ]);
              });
              const artistId = roleModel.findOne({ name: "Artist" }).then(async (artist) => {
                await userModel.create([
                  {
                    username: "artist",
                    firstName: "artist", 
                    lastName: "1", 
                    password: "beetrootartist!", 
                    email: "artist@beetroot.com", 
                    status: "normal", 
                    roles: [artist._id] 
                  },
                ]);
              });
              const listenerId = roleModel.findOne({ name: "Listener" }).then(async (listener) => {
                await userModel.create([
                  {
                    username: "listener",
                    firstName: "listener", 
                    lastName: "1", 
                    password: "beetrootlistener!", 
                    email: "listener@beetroot.com", 
                    status: "normal", 
                    roles: [listener._id] 
                  },
                ]);
              });
            }
          })
          .catch((error) => console.log(error));
      }
    })
    .catch((error) => console.log(error));
}
catch (error) {
  console.log(error);
}

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
