const mongoose = require("mongoose");
const Song = require("../database/schemas/Song");
const Genre = require("../database/schemas/Genre");
const Artist = require("../database/schemas/Artist");
const { artistModel } = require("./Artist");
const { songModel } = require("./Song");
const { genreModel } = require("./Genre");

const songCatalog = (req, res) => {
  return [];
};

//Filter songCatalog by Genre
const Filter = db.collection(songCatalog).find({
  genreFilter: String,
  durationFilter: {
    $gt: Number,
    $lt: Number,
  },
  artistFilter: String,
  titleFilter: String,
});

//Sort songCatalog
db.collection(songCatalog).aggregate([
  {
    project: {
      id: 0,
      result: {
        $sortArray: {
          input: "$songCatalog",
          sortBy: {
            artist: 1,
            ref: artistModel,
            genre: 1,
            ref: genreModel,
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

module.exports = {
  getAllSongs,
};
