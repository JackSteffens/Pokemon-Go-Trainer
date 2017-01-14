// Statistics model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PokemonType = new Schema({

});

var StatisticsSchema = new Schema({
  owner: {type:String, required:true},
  experience: {type:Number required:true},
	prev_level_xp: {type:Number required:true},
	next_level_xp: {type:Number required:true},
	km_walked: {type:Number required:true},
	pokemons_encountered: {type:Number required:true},
	unique_pokedex_entries: {type:Number required:true},
	pokemons_captured: {type:Number required:true},
	evolutions: {type:Number required:true},
	poke_stop_visits: {type:Number required:true},
	pokeballs_thrown: {type:Number required:true},
	eggs_hatched: {type:Number required:true},
	big_magikarp_caught: {type:Number required:true},
	battle_attack_won: {type:Number required:true},
	battle_attack_total: {type:Number required:true},
	battle_defended_won: {type:Number required:true},
	battle_training_won: {type:Number required:true},
	battle_training_total: {type:Number required:true},
	prestige_raised_total: {type:Number required:true},
	prestige_dropped_total: {type:Number required:true},
	pokemon_deployed: {type:Number required:true},
	pokemon_caught_by_type: [PokemonType],
	small_rattata_caught: {type:Number required:true},
	used_km_pool: {type:Number required:false},
	last_km_refill_ms: {type:Number required:false},
});

Statistics = mongoose.model('statistics', StatisticsSchema);

module.exports.Statistics = Statistics;
module.exports.Schema = StatisticsSchema;
