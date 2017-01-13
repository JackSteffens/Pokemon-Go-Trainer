// Pokedex model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PokedexEntry = new Schema({
  pokemon_id: {type:Number, required:true, unique:true},
  times_encountered: {type:Number, required:true},
  times_captured: {type:Number, required:true},
  evolution_stone_pieces: {type:Number, required:true},
  evolution_stones: {type:Number, required:true}
});

var PokedexSchema = new Schema({
  owner:{type:String, required:true},
  pokedex: [PokedexEntry]
});

Pokedex = mongoose.model('pokedex', PokedexSchema);

module.exports.Pokedex = Pokedex;
module.exports.Schema = PokedexSchema;
