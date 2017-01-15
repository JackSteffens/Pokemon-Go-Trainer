// Trainer model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Avatar = new Schema({                  // Trainer's look
  skin: {type:Number, required:true},      // Skin color
  hair: {type:Number, required:true},      // Hair style
  shirt: {type:Number, required:true},     // Shirt style
  pants: {type:Number, required:true},     // Pants style
  hat: {type:Number, required:true},       // Hat style
  shoes: {type:Number, required:true},     // Shoe style
  gender: {type:Number, required:true},    // Gender
  eyes: {type:Number, required:true},      // Eyes color
  backpack: {type:Number, required:true}   // Backpack style
});

var WaypointSchema = new Schema({         // Waypoints, points in the path
  location: {                             // ^ coordinates
    lat: {type:Number, required:true},    //   ^ latitude
    lng: {type:Number, required:true}     //   ^ longitude
  },
  stopover : {type:Boolean, required:true}// ^ dragable point
}, {_id:false});

var DestinationSchema = new Schema({
  origin : {                                // Start of the path
    lat: {type:Number, required:true},      // ^ latitude
    lng: {type:Number, required:true}       // ^ longitude
  },
  destination : {                           // End of the path
    lat: {type:Number, required:true},      // ^ latitude
    lng: {type:Number, required:true}       // ^ longitude
  },
  waypoints : {type:[WaypointSchema], required:true},
  current_waypoint : {type:Number, required:true},  // Current index in Waypoints
  enabled : {type:Boolean, required:true},  // Enable walking
  speed : {type:Number, required:true}      // Speed in km/h
});

var StatisticsSchema = new Schema({
  level: {type:Number, required:true},
  experience: {type:Number, required:true},
	prev_level_xp: {type:Number, required:true},
	next_level_xp: {type:Number, required:true},
	km_walked: {type:Number, required:true},
	pokemons_encountered: {type:Number, required:true},
	unique_pokedex_entries: {type:Number, required:true},
	pokemons_captured: {type:Number, required:true},
	evolutions: {type:Number, required:true},
	poke_stop_visits: {type:Number, required:true},
	pokeballs_thrown: {type:Number, required:true},
	eggs_hatched: {type:Number, required:true},
	big_magikarp_caught: {type:Number, required:true},
	battle_attack_won: {type:Number, required:true},
	battle_attack_total: {type:Number, required:true},
	battle_defended_won: {type:Number, required:true},
	battle_training_won: {type:Number, required:true},
	battle_training_total: {type:Number, required:true},
	prestige_raised_total: {type:Number, required:true},
	prestige_dropped_total: {type:Number, required:true},
	pokemon_deployed: {type:Number, required:true},
	pokemon_caught_by_type: {required:false},
	small_rattata_caught: {type:Number, required:true},
	used_km_pool: {type:Number, required:false},
	last_km_refill_ms: {type:Number, required:false},
});

var TrainerSchema = new Schema({
  login: {                                    // Login name, not required. Just for frontend
    provider: {type:String, required:true},   // Provider 'ptc' or 'google'
    username: {type:String, required:true},   // PTC Username or Google Gmail
    ticket: {type:String, required:false},    // Ticket only required for PTC for token fetching
    accessToken: {type:String, required:false},// Token required for API calls
    apiEndpoint: {type:String, required:false} // API endpoint for API calls
  },
  location: {
    latitude: {type:Number, required:true},     // API requests require player location
    longitude: {type:Number, required:true},    // ^
    accuracy: {type:Number, required:true},     // ^
    last_timestamp: {type:Number, required:true} // Long {milliseconds} , last location update
  },
  username: {type:String,                     // In game (user)name
             required:true,
             unique:true},
  creation_timestamp: {type:Number, required:true}, // Date created
  team: {type:Number, required:true},
  team: {type:Number, required:true},        // Gym team
  avatar: Avatar,
  currency: {
    pokecoin: {type:Number, required:true},  // Gold shop coins
    stardust: {type:Number, required:true}   // Stardust
  },
  max_pokemon_storage: {type:Number, required:true},  // Pokemon storage capacity
  max_item_storage: {type:Number, required:true},     // Backpack storage capacity
  daily_bonus: {
    next_collected_timestamp: {type:Number, required:false},             // Daily bonus availability
    next_defender_bonus_collect_timestamp: {type:Number, required:false} // Defender points availability
  },
  equipped_badge: {
    badge_type: {type:Number, required:true},
    level: {type:Number, required:true},
    next_equip_change_allowed_timestamp_ms: {type:Number, required:true}
  },
  buddy_pokemon: {
  	id: {type:Number, required:true},
  	start_km_walked: {type:Number, required:true},
  	last_km_awarded: {type:Number, required:true}
  },
  battle_lockout_end_ms: {type:Number, required:true},
  statistics: {type:StatisticsSchema, required:false},
  destination: {type:DestinationSchema, required:false}
});

Trainer = mongoose.model('trainers', TrainerSchema);

module.exports.Trainer = Trainer;
module.exports.Schema = TrainerSchema;
