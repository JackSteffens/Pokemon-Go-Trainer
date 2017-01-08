// Inventory model. Includes items, pokemon and incubators
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InventorySchema = new Schema({
  username: {type:String, required:true}, // in-game username, owner of the inv.
  applied_items : {
    item : {} // multiple
  },
  candies : {
    candy: {type:Number},
    family_id: {type:Number}
  },
  egg_incubators: {
    incubator: {
      id: {type:String} // EggIncubatorProto7870015311042744540
      incubator_type: {type:Number}, // 1
      item_id: {type:Number}, // 901
      pokemon_id: {
        high: {type:Number},
        low: {type:Number}
      },
      start_km_walked: {type:Number},
      target_km)walked: {type:Number},
      uses_remaining: {type:Number} // 0
    }
  },
  inventory_upgrades: {

  },
  items : {
    item: {
      item_id : {type:Number},
      count: {type:Number}
    }
  },
  player_camera: {

  },
  player_currency: {

  },
  player_stats: {
    battle_attack_total: {type:Number},
    battle_attack_won: {type:Number},
    battle_defended_won: {type:Number},
    battle_training_total: {type:Number},
    battle_training_won: {type:Number},
    big_magikarp_caught: {type:Number},
    eggs_hatched: {type:Number},
    evolutions: {type:Number},
    experience: {
      low: {type:Number},
      high: {type:Number}
    },
    km_walked: {type:Number},
    level: {type:Number}, // 1
    next_level_exp: {
      high: {type:Number}, // 0
      low: {type:Number}  // 1000
    },
    poke_stop_visits: {type:Number},
    pokeballs_thrown: {type:Number},
    pokemon_caught_by_type: {
      buffer: {type:Buffer}// ?????
    },
    pokemon_deployed: {type:Number},
    pokemons_captured: {type:Number},
    pokemons_encountered: {type:Number},
    prestige_dropped_total: {type:Number},
    prestige_raised_total: {type:Number},
    prev_level_exp: {
      high: {type:Number}, // 0
      low: {type:Number} // 0
    },
    small_rattata_caught: {type:Number},
    unique_pokedex_entries: {type:Number}
  },
  pokedex_entry: {
    entry: {
      evolution_stone_pieces: {type:Number}, // 0
      evolution_stones: {type:Number}, // 0
      pokemon_id: {type:Number}, // 4
      times_captured: {type:Number}, // 1
      times_encountered: {type:Number} // 1
    }
  },
  pokemon_data: {
    additional_cp_multiplier: {type:Number},
    battles_attacked: {type:Number},
    battles_defended: {type:Number},
    captured_cell_id: {
      high: {type:Number}, //1204151270
      low: {type:Number} // 1634729984
    },
    cp: {type:Number},
    cp_multiplier: {type:Number}, // Difference for level-up multiplier and evolve
    creation_time_ms: {
      high: {type:Number}, // 342
      low: {type:Number} // 983538739
    },
    deployed_fort_id: {type:String},
    egg_incubator_id: {type:String},
    egg_km_walked_start: {type:Number},
    egg_km_walked_target: {type:Number}, //5
    favorite: {type:Number}, // 1 or 0 ??
    from_fort: {type:Number}, // 1 or 0 ??
    height_m: {type:Number},
    id: {
      high: {type:Number},
      low: {type:Number}
    },
    individual_attack: {type:Number},
    individuak_defense: {type:Number},
    individuak:stamina: {type:Number},
    is_egg: {type:Boolean},
    move_1: {type:Number},
    move_2: {type:Number},
    nickname: {type:String},
    num_upgrades: {type:Number},
    origin: {type:Number},
    owner_name: {type:String},
    pokeball: {type:Number},
    pokemon_id: {type:Number},
    stamina: {type:Number}, // hp currently
    max_stamina: {type:Number}, // hp max
    weight_kg: {type:Number}
  }
})
