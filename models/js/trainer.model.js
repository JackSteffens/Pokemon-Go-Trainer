// Trainer model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TrainerSchema = new Schema({
  login: {                                    // Login name, not required. Just for frontend
    provider: {type:String, required:true},   // Provider 'ptc' or 'google'
    username: {type:String, required:true},   // PTC Username or Google Gmail
    ticket: {type:String, required:false},    // Ticket only required for PTC for token fetching
    accessToken: {type:String, required:true},// Token required for API calls
    apiEndpoint: {type:String, required:true} // API endpoint for API calls
  },
  location: {
    latitude: {type:Number, required:true},   // API requests require player location
    longitude: {type:Number, required:true},  // ^
    altitude: {type:Number, required:true}    // ^
  },
  username: {type:String,                     // Name used in-game
             required:true,
             unique:true},
  creation_timestamp: {type:Number, required:true},
  team: {type:Number, required:true},
  level: {type:Number, required:false},       // Level
  xp: {type:Number, required:false},          // Current xp
  team: {type:Number, required:true},        // Gym team
  avatar: {                                   // Trainer's look
    skin: {type:Number, required:true},      // Skin color
    hair: {type:Number, required:true},      // Hair style
    shirt: {type:Number, required:true},     // Shirt style
    pants: {type:Number, required:true},     // Pants style
    hat: {type:Number, required:true},       // Hat style
    shoes: {type:Number, required:true},     // Shoe style
    gender: {type:Number, required:true},    // Gender
    eyes: {type:Number, required:true},      // Eyes color
    backpack: {type:Number, required:true}   // Backpack style
  },
  medals: {                                   // Medals and general progress
    km_walked: {type:Number, required:false},
    pokemons_encountered: {type:Number, required:false},
    unique_pokedex_entries: {type:Number, required:false},
    pokemons_captured: {type:Number, required:false},
    evolutions: {type:Number, required:false},
    pokestop_visits: {type:Number, required:false},
    pokeballs_thrown: {type:Number, required:false},
    eggs_hatched: {type:Number, required:false},
    big_magikarps_caught: {type:Number, required:false},
    battle_attack_won: {type:Number, required:false},
    battle_attack_total: {type:Number, required:false},
    battle_defend_won: {type:Number, required:false},
    battle_defend_total: {type:Number, required:false},
    prestige_raised_total: {type:Number, required:false},
    prestige_dropped_total: {type:Number, required:false},
    pokemon_deployed: {type:Number, required:false},
    small_rattata_caught: {type:Number, required:false}
  },
  currency: {
    pokecoin: {type:Number, required:true},
    stardust: {type:Number, required:true}
  },
  max_pokemon_storage: {type:Number, required:true},
  max_item_storage: {type:Number, required:true},
  daily_bonus: {
    next_collected_timestamp: {type:Number, required:false},
    next_defender_bonus_collect_timestamp: {type:Number, required:false}
  }
});

Trainer = mongoose.model('trainers', TrainerSchema);

module.exports.Trainer = Trainer;
module.exports.Schema = TrainerSchema;
