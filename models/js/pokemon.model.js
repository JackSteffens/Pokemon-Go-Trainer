// Pokemon model as displayed in a user's inventory
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PokemonSchema = new Schema({
  trainer: {type:String, required:true},          // Ingame username
  pokedexId: {type:String, required:true},        // 001, 002
  cp: {type:Number, required:true},               // Combat Power (level)
  stamina: {type:Number, required:true},          // Current HP
  maxStamina: {type:Number, required:true},       // Max HP
  move1: {type:String, required:true},            // Attack move 1
  move2: {type:String, required:true},            // Attack move 2
  height: {type:String, required:true},           // Height in meters
  weight: {type:String, required:true},           // Weight in kilograms
  ivAttack: {type:Number, required:true},         // Attack IV points
  ivDefense: {type:Number, required:true},        // Defense IV points
  ivStamina: {type:Number, required:true},        // Stamina IV points
  cpMultiplier: {type:String, required:true},     // Multiplier when evolving
  pokeball: {type:Number, required:true},         // Type of pokeball caught in
  capturedS2CellId: {type:String, required:true}, // ?? Spawn location ??
  creationTime: {type:Number, required:true}      // Date obtained in ms (egg only ??)
});

Pokemon = mongoose.model('invPokemon', PokemonSchema);

module.exports.Pokemon = Pokemon;
module.exports.Schema = PokemonSchema;
