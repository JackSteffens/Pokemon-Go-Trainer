// Dependencies
var path = require('path');
var Pokedex = require(path.resolve(__dirname+'/../models/js/pokedex.model.js')).Pokedex;
var colors = require('colors');

/**
* Fetches a locally stored pokedex from the given trainer
* @param String username
* @param Function callback(error, pokedex)
* @return callback(Error error, Pokedex pokedex) , callback function
*/
function findPokedex(username, callback) {
  Pokedex.findOne(
    {'owner':username},
    function(error, pokedex) {
      if (error) console.log(('[!] Error fetching pokedex \n'+error).red);
      else if (pokedex) console.log('[i] Found pokedex for : '+username);
      return callback(error, pokedex);
    }
  );
}

/**
* Update the existing pokedex from the given trainer
* @param String username
* @param PokedexEntry[] {pokedex} , array Pokedex.PokedexEntry child objects
* @param Function callback(error, pokedex)
* @return callback(Error error, Pokedex pokedex) , callback function
*/
function updatePokedex(username, pokedex, callback) {
  Pokedex.findOneAndUpdate(
    {'owner':username},
    {'pokedex':pokedex},
    {runValidators:true, new:true},
    function(error, pokedex) {
      if (error) console.log(('[!] Error updating pokedex \n'+error).red);
      else if (pokedex) console.log('[i] Updated pokedex for : '+username);
      return callback(error, pokedex);
    }
  );
}

/**
* Update singe PokemonEntry in an existing Pokedex of the given trainer
* @param String username , unique identifier
* @param PokedexEntry {entry} , Pokedex.PokedexEntry child object
* @param Function callback(error, pokedex)
* @return callback(Error error, Pokedex pokedex) , callback function.
*/
function updatePokedexEntry(username, entry, callback) {
  Pokedex.update(
    {'owner':username, 'pokedex.pokemon_id':entry.pokemon_id},
    {'$set':entry},
    {runValidators:true, new:true},
    function(error, pokedex) {
      if (error) console.log(('[!] Error updating pokedex entry \n'+error).red);
      else if (pokedex) console.log('[i] Updated pokedex entry for : '+username+', ID : '+entry.pokemon_id);
      return callback(error, pokedex);
    }
  );
}

/**
* Create a new Pokedex for an existing trainer
* @param String username
* @param PokemonEntry[] {pokedex} , array of Pokedex.PokedexEntry child objects
* @param Function callback(error, pokedex)
* @return callback(Error error, Pokedex pokedex) , callback funtion
*/
function createPokedex(username, pokedex, callback) {
  Pokedex.create(
    {'owner':username, pokedex},
    function(error, pokedex) {
      if (error) console.log(('[!] Error creating pokedex \n' + error).red);
      else if (pokedex) console.log('[i] Created pokedex for : '+username);
      return callback(error, pokedex);
    }
  );
}

// Exports
module.exports = {
  findPokedex : findPokedex,
  updatePokedex : updatePokedex,
  updatePokedexEntry : updatePokedexEntry,
  createPokedex : createPokedex
}
