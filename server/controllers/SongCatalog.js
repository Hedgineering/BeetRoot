const mongoose = require("mongoose");
const Song = require("../database/schemas/Song");
const Genre = require("../database/schemas/Genre");
const { artistModel } = require("./Artist");
const { songModel } = require("./Song");
const { genreModel } = require("./Genre");

const songCatalog = Object.values(songModel); //Creates array of all songs in database

//Filter songCatalog by Genre
const Filter = db.collection(songCatalog).find({
  genereFilter: tags[''],
  durationFilter: {
    $gt: Number,
    $lt: Number, 
  },
  artistFilter: tags[""],
});

//Sort songCatalog by Title
db.collection(songCatalog).aggregate([
  {
    project: {
      id: 0,
      result: {
        $sortArray: {
          input: "$songCatalog",
          sortBy: { title: 1, ref: songModel },
        },
      },
    },
  },
]);

//Sort songCatalog by Artist
db.collection(songCatalog).aggregate([
  {
    project: {
      id: 0,
      result: {
        $sortArray: {
          input: "$songCatalog",
          sortBy: {
            artist: 1,
            genre: 1,
            title: 1,
            duration: -1,
            license: 1,
            published: -1,
            likes: -1,
            shares: -1,
            purchases: -1,
            streams: -1,
            ref: songModel,
          },
        },
      },
    },
  },
]);

module.exports = songCatalog; 
