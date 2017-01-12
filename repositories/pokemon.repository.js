// Model
var path = require('path')
var Pokemon = require(path.resolve(__dirname+'/../models/js/pokemon.model.js')).Pokemons;

/**
* Fetch Pokemons by Trainer username
* @param String username , unique ID
* @return
*/
function findPokemonTeam(username, callback) {
  Pokemon.findOne({'owner': username}, function(error, team) {
    return callback(error, team);
  });
}

/**
* Update entire team from a specific Trainer
* @param String username , unique ID
* @param Pokemon[] team , array of Pokemon child objects
* @param function callback(Error error, Pokemons newTeam)
* @return callback(Error error, Pokemons newTeam)
*/
function updatePokemonTeam(username, team, callback) {
  Pokemon.findOneAndUpdate(
    {'owner':username},
    team,
    {
      runValidators:true,
      new:true
    },
    function(error, newTeam) {
      if (error) {
        console.log('[!] Error updating team');
        console.log(error);
      } else {
        console.log('[i] Updated team for : '+username);
      }
      return callback(error, newTeam);
    });
}

/**
* Create new Pokemons object
* @param String username , unique ID
* @param Pokemom[] team , array of child Pokemon objects
* @param function callback(Error error, Pokemons newTeam)
* @return callback(Error error, Pokemons neaTeam)
*/
function createPokemonTeam(username, team, callback) {
  Pokemon.create({
    owner:username,
    pokemons:team
  },
  function(error, newTeam) {
    if (error) {
      console.log('[!] Error creating team');
      console.log(error);
    } else {
      console.log('[i] Created team for : '+username);
    }
    return callback(error, newTeam);
  });
}

// Exports
module.exports = {
  findPokemonTeam : findPokemonTeam,
  updatePokemonTeam : updatePokemonTeam,
  createPokemonTeam : createPokemonTeam
}
