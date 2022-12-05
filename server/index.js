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
const cors = require("cors");
const corsOptions = require("./config/CorsOptions");
const { logger } = require("./middleware/LogEvents");
const errorHandler = require("./middleware/ErrorHandler");
const verifyJWT = require("./middleware/VerifyJWT");
const cookieParser = require("cookie-parser");
const credentials = require("./middleware/CorsCredentials");
const mongoose = require("mongoose");
const connectDB = require("./config/DbConnection");

const { roleModel } = require("./models/Role");
const { userModel } = require("./models/User");
const { genreModel } = require("./models/Genre");
const { artistModel } = require("./models/Artist");
const { songModel } = require("./models/Song");
const { listedSongModel } = require("./models/ListedSong");
const { formatModel } = require("./models/Format");

const authController = require("./controllers/AuthController");
const commentController = require("./controllers/CommentController");

const app = express();

// Connect to MongoDB
const mongoConnectionUri =
  env["MONGO_URI_TEST"] || "mongodb://localhost/beetroot";
console.log(`Connecting to MongoDB at ${mongoConnectionUri}`);
connectDB(mongoConnectionUri);

// Custom middleware logger
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// Built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// Built-in middleware for json
app.use(express.json());

// Middleware for cookies
app.use(cookieParser());

// Serve static files
app.use("/", express.static(path.join(__dirname, "/public")));

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
        let adminUser, artistUser, listenerUser;
        await userModel
          .find({})
          .then(async (users) => {
            if (users.length === 0) {
              console.log(
                "No users found in database. Adding users to database."
              );
              const adminId = await roleModel
                .findOne({ name: "Admin" })
                .then(async (admin) => {
                  adminUser = await userModel.create({
                    username: "admin",
                    firstName: "admin",
                    lastName: "1",
                    password: "beetrootadmin!",
                    email: "admin@beetroot.com",
                    status: "normal",
                    roles: [admin._id],
                  });
                });
              const artistId = await roleModel
                .findOne({ name: "Artist" })
                .then(async (artist) => {
                  artistUser = await userModel.create({
                    username: "artist",
                    firstName: "artist",
                    lastName: "1",
                    password: "beetrootartist!",
                    email: "artist@beetroot.com",
                    status: "normal",
                    roles: [artist._id],
                  });

                  //Seeding Genre Data
                  await genreModel.find({}).then(async (genres) => {
                    if (genres.length == 0) {
                      console.log(
                        "No genres found in database. Adding genres."
                      );
                      const popGenre = await genreModel.create({ name: "pop" });

                      //Seeding Artist Data
                      console.log(
                        "No artists found in database. Adding artists."
                      );
                      let artistOne = await artistModel.create({
                        user: artistUser._id,
                        genre: popGenre._id,
                      });

                      //Seeding Song Data
                      console.log("No songs found in database. Adding songs.");
                      let songOne = await songModel.create({
                        artist: artistOne._id,
                        genre: popGenre._id,
                        title: "Uptown Funk",
                        duration: 125,
                        explicit: false,
                        license: "Licensed",
                        description: "it's a song",
                        published: new Date(2018, 3, 5),
                      });

                      //Seeding Listed Song Data
                      console.log("No songs found in database. Adding songs.");
                      let listedSongOne = await listedSongModel.create({
                        creator: artistOne._id,
                        song: songOne._id,
                      });

                      //Seeding Format Data
                      console.log(
                        "No formats found in database. Adding formats."
                      );
                      let formatOne = await formatModel.create({
                        song: songOne._id,
                        price: 15,
                        type: "mp3",
                        preview: `${__dirname}/database/userFiles/audio/Just_The_Two_Of_Us.mp3`,
                        source: `${__dirname}/database/userFiles/audio/Just_The_Two_Of_Us.mp3`,
                      });

                      //Updating Song with Format
                      console.log("Updating song with format.");
                      await listedSongModel.updateOne(
                        { _id: listedSongOne._id },
                        { $set: { formats: [formatOne._id] } }
                      );
                    }
                  });
                });
              const listenerId = await roleModel
                .findOne({ name: "Listener" })
                .then(async (listener) => {
                  listenerUser = await userModel.create({
                    username: "listener",
                    firstName: "listener",
                    lastName: "1",
                    password: "beetrootlistener!",
                    email: "listener@beetroot.com",
                    status: "normal",
                    roles: [listener._id],
                  });
                });
            }
          })
          .catch((error) => console.log(error));
      }
    })
    .catch((error) => console.log(error));
} catch (error) {
  console.log(error);
}

// =================================
// Configure Express Endpoints Here
// =================================

// Non-Protected Endpoints ---------

// Protected Endpoints -------------
app.use(verifyJWT); // middleware to verify JWT token


// POST for registration and login
// app.post("/register", authController.register);
// app.post("/login", authController.login);
// app.post("/catalog/:listingId", commentController.postComment);

// GET for root directory (default)
// app.get("/", (req, res) => { res.sendFile(path.join(__dirname, "index.html")); });

// Catch all for 404
app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
      res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
      res.json({ "error": "404 Not Found" });
  } else {
      res.type('txt').send("404 Not Found");
  }
});

app.use(errorHandler);

// This comes at the end as this starts the server
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(server_port, () => {
    console.log(`Server listening on port ${server_port}`);
  });
});
