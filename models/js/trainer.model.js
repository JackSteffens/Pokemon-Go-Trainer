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

var TrainerSchema = new Schema({
  login: {                                    // Login name, not required. Just for frontend
    provider: {type:String, required:true},   // Provider 'ptc' or 'google'
    username: {type:String, required:true},   // PTC Username or Google Gmail
    ticket: {type:String, required:false},    // Ticket only required for PTC for token fetching
    accessToken: {type:String, required:false},// Token required for API calls
    apiEndpoint: {type:String, required:false} // API endpoint for API calls
  },
  location: {
    latitude: {type:Number, required:true},   // API requests require player location
    longitude: {type:Number, required:true},  // ^
    accuracy: {type:Number, required:true}    // ^
  },
  username: {type:String,                     // In game (user)name
             required:true,
             unique:true},
  creation_timestamp: {type:Number, required:true}, // Date created
  team: {type:Number, required:true},
  level: {type:Number, required:false},      // Level
  xp: {type:Number, required:false},         // Current xp
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
  battle_lockout_end_ms: {type:Number, required:true}
});

Trainer = mongoose.model('trainers', TrainerSchema);

module.exports.Trainer = Trainer;
module.exports.Schema = TrainerSchema;
