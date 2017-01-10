// Dependencies
var config = require('../config.js');
var path = require('path');

/**
* A representation of the Pokemon Go Pokedex in a JSON file
* Credits to https://github.com/Biuni/PokemonGOPokedex
* @return JSON file
*/
exports.getPokedex = function(req, res)  {
    res.sendFile(path.resolve(__dirname+'/../models/json/pokedex.model.json'));
}
