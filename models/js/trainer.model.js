// Trainer model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TrainerSchema = new Schema({
  login: {                                    // Login name, not required. Just for frontend
    type: {type:String, required:true},       // PTC or Google
    username: {type:String, required:false},  // Only needed when type is PTC ?? Really only for PTC ??
    accessToken: {type:String, required:true},// Token required for API calls
    apiEndpoint: {type:String, required:true}// API endpoint for API calls
  },
  location: {
    latitude: {type:Number, required:true},   // API requests require player location
    longitude: {type:Number, required:true},  // ^
    altitude: {type:Number, required:true}    // ^
  },
  username: {type:String,                     // Name used in-game
             required:true,
             unique:true},
  level: {type:Number, required:false},       // Level
  xp: {type:Number, required:false},          // Current xp
  team: {type:Number, required:false},        // Gym team
  avatar: {                                   // Trainer's look
    skin: {type:Number, required:false},      // Skin color
    hair: {type:Number, required:false},      // Hair style
    shirt: {type:Number, required:false},     // Shirt style
    pants: {type:Number, required:false},     // Pants style
    hat: {type:Number, required:false},       // Hat style
    shoes: {type:Number, required:false},     // Shoe style
    gender: {type:Number, required:false},    // Gender
    eyes: {type:Number, required:false},      // Eyes color
    backpack: {type:Number, required:false}   // Backpack style
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
    pokecoin: {type:Number, required:false},
    stardust: {type:Number, required:false}
  }
});

Trainer = mongoose.model('trainers', TrainerSchema);

module.exports.Trainer = Trainer;
module.exports.Schema = TrainerSchema;
