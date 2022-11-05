const mongoose = require("mongoose");
const Song = require("./schemas/Song");
const { songModel } = require("./Song");

const songCatalog = Object.values(Song);