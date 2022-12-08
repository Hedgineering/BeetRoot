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

// ===========================
// Module and Middleware Setup
// ===========================

// Npm Packages
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// Custom Modules
const corsOptions = require("./config/CorsOptions");
const { logger } = require("./middleware/LogEvents");
const errorHandler = require("./middleware/ErrorHandler");
const { verifyJWT } = require("./middleware/VerifyJwt");
const credentials = require("./middleware/CorsCredentials");
const connectDB = require("./config/DbConnection");
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

// ==========================
// Add Seed Data for Database
// ==========================
const { roleModel } = require("./models/Role");
const { userModel } = require("./models/User");
const { genreModel } = require("./models/Genre");
const { artistModel } = require("./models/Artist");
const { songModel } = require("./models/Song");
const { listedSongModel } = require("./models/ListedSong");
const { formatModel } = require("./models/Format");

async function SeedDatabase() {
  try {
    // Seed Roles
    const roles = await roleModel.find({}).exec();
    if (roles.length === 0) {
      console.log("No roles found in database. Seeding roles...");
      await roleModel.create([
        { name: "Listener", clearanceLevel: 1 },
        { name: "Artist", clearanceLevel: 1 },
        { name: "Admin", clearanceLevel: 2 },
      ]);
    }

    // Seed Users
    const users = await userModel.find({}).exec();
    if (users.length === 0) {
      console.log("No users found in database. Seeding users...");
      const saltRounds = 10;

      // Insert a default admin user
      const adminId = await roleModel.findOne({ name: "Admin" }).exec();
      const encryptedAdminPassword = await bcrypt.hash(
        "beetrootadmin!",
        saltRounds
      );
      const adminUser = await userModel.create({
        username: "admin",
        firstName: "admin",
        lastName: "1",
        password: encryptedAdminPassword,
        email: "admin@beetroot.com",
        status: "normal",
        roles: [adminId._id],
      });

      // Insert a default artist user
      const artistId = await roleModel.findOne({ name: "Artist" }).exec();
      const encryptedArtistPassword = await bcrypt.hash(
        "beetrootartist!",
        saltRounds
      );
      const artistUser = await userModel.create({
        username: "artist",
        firstName: "artist",
        lastName: "1",
        password: encryptedArtistPassword,
        email: "artist@beetroot.com",
        status: "normal",
        roles: [artistId._id],
      });

      // Insert a default listener user
      const listenerId = await roleModel.findOne({ name: "Listener" }).exec();
      const encryptedListenerPassword = await bcrypt.hash(
        "beetrootlistener!",
        saltRounds
      );
      const listenerUser = await userModel.create({
        username: "listener",
        firstName: "listener",
        lastName: "1",
        password: encryptedListenerPassword,
        email: "listener@beetroot.com",
        status: "normal",
        roles: [listenerId._id],
      });
    }

    // Seed Genres
    const genres = await genreModel.find({}).exec();
    if (genres.length === 0) {
      console.log("No genres found in database. Seeding genres...");
      await genreModel.create([
        { name: "Rock" },
        { name: "Pop" },
        { name: "Jazz" },
        { name: "Hip Hop" },
        { name: "Classical" },
      ]);
    }

    // Seed Artists
    const artists = await artistModel.find({}).exec();
    if (artists.length === 0) {
      console.log("No artists found in database. Seeding artists...");
      const artistUser = await userModel.findOne({ username: "artist" }).exec();
      const popGenre = await genreModel.findOne({ name: "Pop" }).exec();
      await artistModel.create({
        username: artistUser.username,
        user: artistUser._id,
        genre: popGenre._id,
      });
    }

    // Seed Songs
    const songs = await songModel.find({}).exec();
    if (songs.length === 0) {
      console.log("No songs found in database. Seeding songs...");
      const artistUser = await artistModel.findOne({ username: "artist" }).exec();
      const popGenre = await genreModel.findOne({ name: "Pop" }).exec();
      const songOne = await songModel.create({
        artist: artistUser._id,
        genre: popGenre._id,
        title: "Just The Two Of Us",
        duration: 125,
        explicit: false,
        license: "Licensed",
        description: "it's a song",
        published: new Date(2018, 3, 5),
      });
      await artistModel.updateOne({ _id: artistUser._id }, { $push: { songs: songOne._id } });
      await genreModel.updateOne({ _id: popGenre._id }, { $push: { songs: songOne._id } });
    }

    // Seed Listed Songs
    const listedSongs = await listedSongModel.find({}).exec();
    if (listedSongs.length === 0) {
      console.log("No listed songs found in database. Seeding listed songs...");
      const artistOne = await artistModel.findOne({}).exec();
      const songOne = await songModel.findOne({}).exec();
      await listedSongModel.create({
        creator: artistOne._id,
        song: songOne._id,
      });
    }

    // Seed Formats
    const formats = await formatModel.find({}).exec();
    if (formats.length === 0) {
      console.log("No formats found in database. Seeding formats...");
      const songOne = await songModel.findOne({}).exec();
      const listedSongOne = await listedSongModel.findOne({}).exec();
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
        { $push: { formats: formatOne._id } }
      );
    }
  } catch (error) {
    console.log(error);
  }
}

SeedDatabase();

// ===========================
// Configure Express Endpoints
// ===========================

// Non-Protected Endpoints ---------
app.use("/", require("./routes/Root"));
app.use("/register", require("./routes/Register"));
app.use("/login", require("./routes/Login"));
app.use("/refresh", require("./routes/Refresh"));
app.use("/logout", require("./routes/Logout"));

// Protected Endpoints -------------
// middleware to verify JWT token, 
// only authenticated users can access protected endpoints
app.use(verifyJWT); // Identity has not been tampered with

// app.use("/api/album", require("./routes/api/Albums"));
// app.use("/api/artist", require("./routes/api/Artists"));
app.use("/api/comment", require("./routes/api/Comments")); // TODO: test this endpoint
// app.use("/api/format", require("./routes/api/Formats"));
app.use("/api/genre", require("./routes/api/Genres"));
app.use("/api/history", require("./routes/api/Histories")); // TODO: test this endpoint
// app.use("/api/library", require("./routes/api/Libraries"));
// app.use("/api/listedsong", require("./routes/api/ListedSongs"));
// app.use("/api/playlist", require("./routes/api/Playlists"));
// app.use("/api/purchasedsong", require("./routes/api/PurchasedSongs"));
app.use("/api/role", require("./routes/api/Roles")); // TODO: test this endpoint
// app.use("/api/song", require("./routes/api/Songs"));
app.use("/api/user", require("./routes/api/Users"));

// Catch all for 404
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

// Error Handling at the end of the middleware chain
// to be done if all other routes fail
app.use(errorHandler);

// This comes at the end as this starts the server
// after all the configuration and seeding is done
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(server_port, () => {
    console.log(`Server listening on port ${server_port}`);
  });
});
