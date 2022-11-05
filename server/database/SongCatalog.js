const mongoose = require("mongoose");
const Song = require("./schemas/Song");
const Genre = require("./schemas/Genre");
const { artistModel } = require("./Artist");
const { songModel } = require("./Song");

const songCatalog = Object.values(Song); //Creates array of all songs in database

//Filter songCatalog by Genre
const Filter = db.collection(songCatalog).find({
    genereFilter: (tags)[''],
    dim_cm: {
         $gt: Number, $lt: Number 
        }, // length filter
    artistFilter: (tags)['']
})



//Filter songCatalog by Artist
const artistFilter = db.collection(songCatalog).find({
    tags: ['']
  });

//Sort songCatalog by Title
db.collection(songCatalog).aggregate(
