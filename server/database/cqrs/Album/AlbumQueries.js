const {albumModel} = require("../../schemas/Album")

const getAllAlbums = () => {
    return albumModel.find({});
}

const getSpecificAlbums = (options) => {
    return albumModel.find(options);
}

module.exports = {
    getAllAlbums,
    getSpecificAlbums
}