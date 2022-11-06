const { purchasedSongModel } = require("../../schemas/PurchasedSong");

const getAllPurchasedSongs = () => {
  return purchasedSongModel.find({});
};

const getSpecificPurchasedSongs = (options) => {
  return purchasedSongModel.find(options);
};

module.exports = {
  getAllPurchasedSongs,
  getSpecificPurchasedSongs,
};
