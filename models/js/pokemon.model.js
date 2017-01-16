// Pokemon model as displayed in a user's inventory
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Child pokemon
var Pokemon = new Schema({
	id: {type:String, required:true},          // Long unique ID
	pokemon_id: {type:Number, required:true},  // Pokedex ID
	cp: {type:Number, required:true},          // CP level
	stamina:  {type:Number, required:true},    // Stamina (battles)
	stamina_max: {type:Number, required:true}, // Stamina max
	move_1: {type:Number, required:true},      // Attack 1 Enum
	move_2: {type:Number, required:true},      // Attack 2 Enum
	deployed_fort_id: {type:String, required:false}, // Gym ID
	is_egg: {type:Boolean, required:true},     // Is egg
	egg_km_walked_target: {type:Number, required:true}, // If egg, km target
	egg_km_walked_start: {type:Number, required:true}, // If egg, km surpassed
	origin: {type:Number, required:true},      // ??
	height_m: {type:Number, required:true},    // Height in meters
	weight_kg: {type:Number, required:true},   // Weight in kilograms
	individual_attack: {type:Number, required:true},   // IV attack
	individual_defense: {type:Number, required:true},  // IV defense
	individual_stamina: {type:Number, required:true},  // IV stamina
	cp_multiplier: {type:Number, required:true}, // Level up multiplier
	pokeball: {type:Number, required:true},    // Pokeball type Enum
	location: {
		lat: {type:Number, required:true},
		lng: {type:Number, required:true}
	},
	battles_attacked: {type:Number, required:true},  // Gyms attacked
	battles_defended: {type:Number, required:true},  // Gyms defended
	egg_incubator_id: {type:String, required:false},  // If egg, inside which incubator ID
	creation_time_ms: {type:Number, required:true},  // Date obtained
	num_upgrades: {type:Number, required:true},      // ??
	additional_cp_multiplier: {type:Number, required:true},  // CP Multiplier alters ??
	favorite: {type:Number, required:true},    // Is favorite (why not a bool?)
	nickname: {type:String, required:false},   // Nickname
	from_fort: {type:Number, required:true},    // Might mean that it's caught at a pokestop (fort) with lures
	buddy_candy_awarded: {type:Number, required:false}, // Candy awarded as buddy
	buddy_total_km_walked: {type:Number, required:false} // KM walked as buddy {Long}
});

var PokemonTeam = new Schema({
  owner: {type:String, required:true, unique:true},	// Ingame username
  pokemons: [Pokemon] // Array of Pokemon objects
});

Pokemons = mongoose.model('pokemonteams', PokemonTeam);

module.exports.Pokemons = Pokemons;
module.exports.Schema = PokemonTeam;
