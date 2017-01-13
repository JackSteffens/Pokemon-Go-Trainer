// Model
var path = require('path');
var Pokemon = require(path.resolve(__dirname+'/../models/js/pokemon.model.js')).Pokemons;
var colors = require('colors');

/**
* Fetch Pokemons by Trainer username
* @param String username , unique ID
* @param Function callback(error, team)
* @return callback(Error error, PokemonTeam team)
*/
function findPokemonTeam(username, callback) {
  Pokemon.findOne(
    {'owner': username},
    function(error, team) {
      if (error) console.log(('[!] Error fetching pokemon team \n'+error).red);
      else if (team) console.log('[i] Found pokemon team for : '+username);
      return callback(error, team);
    }
  );
}

/**
* Update entire team from a specific Trainer
* @param String username , unique ID
* @param Pokemon[] {team} , array of PokemonTeam.Pokemon child objects
* @param function callback(Error error, Pokemons newTeam)
* @return callback(Error error, Pokemons newTeam)
*/
function updatePokemonTeam(username, team, callback) {
  Pokemon.findOneAndUpdate(
    {'owner':username},
    {'pokemons':team},
    {runValidators:true, new:true},
    function(error, newTeam) {
      if (error) console.log(('[!] Error updating team \n'+error).red);
      else if (newTeam) console.log('[i] Updated team for : '+username);
      return callback(error, newTeam);
    }
  );
}

/**
* Create new Pokemons object
* @param String username , unique ID
* @param Pokemom[] {team} , array of PokemonTeam.Pokemon child objects
* @param function callback(error, newTeam)
* @return callback(Error error, Pokemons newTeam)
*/
function createPokemonTeam(username, team, callback) {
  Pokemon.create(
    {'owner':username, 'pokemons':team},
    function(error, newTeam) {
      if (error) console.log(('[!] Error creating team \n'+error).red);
      else console.log('[i] Created team for : '+username);
      return callback(error, newTeam);
    }
  );
}

// Exports
module.exports = {
  findPokemonTeam : findPokemonTeam,
  updatePokemonTeam : updatePokemonTeam,
  createPokemonTeam : createPokemonTeam
}
