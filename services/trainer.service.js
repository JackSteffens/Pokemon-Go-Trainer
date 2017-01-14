// Dependencies
var path = require('path');                 // Path resolver
var config = require('../config.js');       // Configuration
var CustomAPI = require('../CustomAPI.js'); // Niantic API
var request = require('request');           // HTTP requests
var protobuf = require('protobufjs');       // Decoding responses using .proto
var GoogleOAuth = require('gpsoauthnode');  // Google authentication
var Long = require('long')                  // Long for date timestamps
var colors = require('colors');             // Console collors

// Repositories
var trainerRepo = require(path.resolve(__dirname+'/../repositories/trainer.repository.js'));
var pokemonRepo = require(path.resolve(__dirname+'/../repositories/pokemon.repository.js'));
var badgeRepo = require(path.resolve(__dirname+'/../repositories/badge.repository.js'));
var inventoryRepo = require(path.resolve(__dirname+'/../repositories/inventory.repository.js'));
var pokedexRepo = require(path.resolve(__dirname+'/../repositories/pokedex.repository.js'));
var candyRepo = require(path.resolve(__dirname+'/../repositories/candy.repository.js'));

// Google oAuth
var google = new GoogleOAuth

// Configuration
request = request.defaults({jar: request.jar()}); // For some reason this shit is needed to log in.

/**
* Authenticate on the Niantic servers using the identification tokens
* from the handshake request and character credentials given by the user.
* @param Object {data} , contains String {data.lt} & String {data.execution}
* @param Object {credentials} , contains data equired for authentication
* @param Function callback(Error error, Trainer trainerObj), post login & error handling function
*/
function ptcHandshakeCallback(data, credentials, callback) {
  options = {
    url: config.LOGIN_URL,
    form: {
      'lt': data.lt,
      'execution': data.execution,
      '_eventId': 'submit',
      'username': credentials.username,
      'password': credentials.password
    },
    headers: config.REQ_HEADERS
  };

  // SECOND REQUEST //
  request.post(options, function(err, response, body) {
    if(err) {return callback(err);}
    if (body) {
      var parsedBody = JSON.parse(body);
      if (parsedBody.errors && parsedBody.errors.length !== 0) {
        return callback('Error logging in: ' + parsedBody.errors[0], null);
      }
    }
    console.log('[i] Second request successful');
    var ticket = response.headers['location'].split('ticket=')[1];
    if (!ticket) {return callback('No ticket found!');}
    console.log('[i] ticket : '+ticket);

    var authObjects = {
      ticket : ticket,
      token : undefined,
      endpoint : undefined
    }
    ptcLoginCallback(authObjects, credentials, callback)
  });
}

/**
* Does a followup request to obtain the API token from Niantic's servers.
* @param Object {authObjects} , contains the ticket
* @param Object {credentials} , contains data equired for authentication
* @param Function callback, post login & error handling function
*/
function ptcLoginCallback(authObjects, credentials, callback) {
  options = {
    url: config.LOGIN_OAUTH,
    form: {
      'client_id': config.CLIENT_ID,
      'redirect_uri': 'https://www.nianticlabs.com/pokemongo/error',
      'client_secret': config.CLIENT_SECRET,
      'grant_type': 'refresh_token',
      'code': authObjects.ticket
    },
    headers: config.REQ_HEADERS
  };
  // THIRD REQUEST //
  request.post(options, function(err, response, body) {
    if(err) {return callback(err);}

    var token;
    token = body.split('token=')[1];
    token = token.split('&')[0];
    if (!token) {
      return callback('Login failed. No token recieved!');
    }
    authObjects.token = token;
    console.log('[i] Session token: ' + token);
    postTokenCallback(authObjects, credentials, callback);
  });
}

/**
* Get the requests API endpoint for a specific account and update Trainer info
* such as profile, inventory, badges and pokemon team.
* @param Object {authObjects} , contains the ticket & token
* @param Object {credentials} , contains data equired for authentication
* @param Function callback(Error error, Traienr trainerObj), post login & error handling function
*/
function postTokenCallback(authObjects, credentials, callback) {
  var trainerObj = {
    login: {
      provider: (credentials.provider).toString(),
      username: credentials.username,
      ticket: authObjects.ticket,
      accessToken: authObjects.token
    },
    location: {
      latitude: parseFloat(credentials.latitude),
      longitude: parseFloat(credentials.longitude),
      accuracy: 0
    }
  }
  getApiEndpoint(trainerObj, function(error, trainerObj) {
    if (error) {return callback(error);}
    // Fetching base Trainer object
    fetchTrainerData(trainerObj, function(error, statistics) {
      if (error) {callback(error); return;}
      trainerObj = parseTrainerData(trainerObj, statistics);
      console.log("[i] Authentication process complete.");

      // Fetching badges
      fetchProfile(trainerObj, function(error, badges) {
        if (error)
          console.log(('[!] Error fetching trainer profile :'+error).red);
        else if (badges)
          storeProfile(trainerObj, badges.badges);
        else
          console.log(('[!] No badges returned from Niantic server').red)
      });

      // Fetching inventory
      fetchInventory(trainerObj, function(error, inventory) {
        if (error) {
          console.log(('[!] Error fetching inventory :'+error).red);
        } else if (inventory) {
          console.log('[i] Inventory received.');
          var original_timestamp = new Date(
            new Long(
              inventory.inventory_delta.original_timestamp_ms.low,
              inventory.inventory_delta.original_timestamp_ms.high,
              inventory.inventory_delta.original_timestamp_ms.unsigned
          ));

          var team = [],
              items = [],
              pokedex = [],
              upgrades = [],
              incubators = [],
              candy = [],
              stats = {};

          var new_timestamp = new Date(
            new Long(
              inventory.inventory_delta.new_timestamp_ms.low,
              inventory.inventory_delta.new_timestamp_ms.high,
              inventory.inventory_delta.new_timestamp_ms.unsigned
          ));
          console.log('[i] original_timestamp_ms : '+original_timestamp);
          console.log('[i] new_timestamp_ms : '+new_timestamp);
          console.log('[i] inventory items : ');
          inventory = inventory.inventory_delta.inventory_items;
          for (var index = 0; index < inventory.length; index++) {
            if (inventory[index].inventory_item_data.item && inventory[index].inventory_item_data.item.item_id)
              items.push(inventory[index].inventory_item_data.item);
            else if (inventory[index].inventory_item_data.player_stats)
              stats = inventory[index].inventory_item_data.player_stats;
            else if (inventory[index].inventory_item_data.candy)
              candy.push(inventory[index].inventory_item_data.candy);
            else if (inventory[index].inventory_item_data.egg_incubators)
              incubators.push(inventory[index].inventory_item_data.egg_incubators);
            else if (inventory[index].inventory_item_data.pokedex_entry)
              pokedex.push(inventory[index].inventory_item_data.pokedex_entry);
            else if (inventory[index].inventory_item_data.inventory_upgrades)
              upgrades.push(inventory[index].inventory_item_data.inventory_upgrades);
            else if (inventory[index].inventory_item_data.pokemon_data)
              team.push(inventory[index].inventory_item_data.pokemon_data);
          }
          console.log('[i] team       : '+team.length);
          console.log('[i] items      : '+items.length);
          console.log('[i] pokedex    : '+pokedex.length);
          console.log('[i] upgrades   : '+upgrades.length);
          console.log('[i] incubators : '+incubators.length);
          console.log('[i] candy      : '+candy.length);

          storePokemonTeam(trainerObj, team);
          storeInventoryItems(trainerObj, items);
          storePokedex(trainerObj, pokedex);
          storeCandy(trainerObj, candy);
          storeStatistics(trainerObj, stats);
          // storeInventoryUpgrades(trainerObj, upgrades);
          // storeEggIncubators(trainerObj, incubators);
          console.log('[i] inventory count : ['+inventory.length+']');
        } else {
          console.log(('[!] No inventory received').red)
        }
      });
      // Storing fetched base Trainer object
      storeTrainerData(trainerObj, function(error, newTrainerObj) {
        callback(error, newTrainerObj);
      });
    }); // fetchTrainerData
  }); // getApiEndpoint
}

/**
* Parses the Niantic server response statistics into a Trainer object that
* our local database and application understands.
* @param Trainer {trainerObj}
* @param Object {statistics}
* @return Trainer {trainerObj}
*/
function parseTrainerData(trainerObj, statistics) {
  trainerObj.creation_timestamp = new Long(
    statistics.creation_timestamp_ms.low,
    statistics.creation_timestamp_ms.high,
    statistics.creation_timestamp_ms.unsigned);
  trainerObj.username = statistics.username;
  trainerObj.currency = {
    pokecoin : statistics.currencies[0].amount,
    stardust : statistics.currencies[1].amount
  }
  trainerObj.max_pokemon_storage = statistics.max_pokemon_storage;
  trainerObj.max_item_storage = statistics.max_item_storage;
  trainerObj.team = statistics.team;
  trainerObj.avatar = {
    skin  : statistics.avatar.skin,
    hair  : statistics.avatar.hair,
    shirt : statistics.avatar.shirt,
    pants : statistics.avatar.pants,
    hat   : statistics.avatar.hat,
    shoes : statistics.avatar.shoes,
    gender: statistics.avatar.gender,
    eyes  : statistics.avatar.eyes,
    backpack: statistics.avatar.backpack
  };
  trainerObj.daily_bonus = {
    next_collected_timestamp : new Long(
      statistics.daily_bonus.next_collected_timestamp_ms.low,
      statistics.daily_bonus.next_collected_timestamp_ms.high,
      statistics.daily_bonus.next_collected_timestamp_ms.unsigned),
    next_defender_bonus_collect_timestamp : new Long(
      statistics.daily_bonus.next_defender_bonus_collect_timestamp_ms.low,
      statistics.daily_bonus.next_defender_bonus_collect_timestamp_ms.high,
      statistics.daily_bonus.next_defender_bonus_collect_timestamp_ms.unsigned)
  };

  return trainerObj;
}

/**
* Searches for existing badges based on Trainer's username and decides to
* create a new database entry or update an existing one.
* @param Trainer {trainerObj} , containing the old trainer statistics but with new authorization values
* @param Object {badges}, containing updated trainer badges
*/
function storeProfile(trainerObj, badges) {
  badgeRepo.findByUsername(trainerObj.username, function(error, oldBadges) {
    if (!error) {
      if (oldBadges) // updateBadges(username, badges);
        badgeRepo.updateBadges(trainerObj.username, badges, function(error, newBadges) {});
      else
        badgeRepo.createBadges(trainerObj.username, badges, function(error, newBadges) {});
    }
  });
}

/**
* Searches for an existing trainer and decides to create a new database entry
* or update an existing one.
* @param Trainer {trainerObj} , containing the old trainer statistics but with new authorization values
* @param Object {statistics}, containing new trainer statistics
* @param callback(error, obj) return function
* @return callback(Error error, Trainer trainerObj)
*/
function storeTrainerData(trainerObj, callback) {
  trainerRepo.getTrainer(trainerObj.username, function(error, oldTrainer) {
    if (error) {
      return callback(error);
    } else if (oldTrainer) {
      return updateTrainer(trainerObj, callback);
    } else {
      return createTrainer(trainerObj, callback);
    }
  });
}

/**
* Parse Pokemon objects from Niantic's server to make them compatible
* with the database.
* @param Pokemon[] {team} (from server, uncompatible)
* @return Pokemon[] {team} (model like, compatible)
*/
function parsePokemonTeam(team) {
  for(var i = 0; i < team.length; i++) {
    var pokemon = {
      id : new Long(
        team[i].id.low,
        team[i].id.high,
        team[i].id.unsigned
      ),
      pokemon_id : team[i].pokemon_id,
    	cp: team[i].cp,
    	stamina:  team[i].stamina,
    	stamina_max: team[i].stamina_max,
    	move_1: team[i].move_1,
    	move_2: team[i].move_2,
    	deployed_fort_id: team[i].deployed_fort_id,
    	is_egg: team[i].is_egg,
    	egg_km_walked_target: team[i].egg_km_walked_target,
    	egg_km_walked_start: team[i].egg_km_walked_start,
    	origin: team[i].origin,
    	height_m: team[i].height_m,
    	weight_kg: team[i].weight_kg,
    	individual_attack: team[i].individual_attack,
    	individual_defense: team[i].individual_defense,
    	individual_stamina: team[i].individual_stamina,
    	cp_multiplier: team[i].cp_multiplier,
    	pokeball: team[i].pokeball,
    	captured_cell_id: new Long(
        team[i].captured_cell_id.low,
        team[i].captured_cell_id.high,
        team[i].captured_cell_id.unsigned
      ),
    	battles_attacked: team[i].battles_attacked,
    	battles_defended: team[i].battles_defended,
    	egg_incubator_id: team[i].egg_incubator_id,
    	creation_time_ms: new Long(
        team[i].creation_time_ms.low,
        team[i].creation_time_ms.high,
        team[i].creation_time_ms.unsigned
      ),
    	num_upgrades: team[i].num_upgrades,
    	additional_cp_multiplier: team[i].additional_cp_multiplier,
    	favorite: team[i].favorite,
    	nickname: team[i].nickname,
    	from_fort: team[i].from_fort,
      buddy_candy_awarded: team[i].buddy_candy_awarded,
      buddy_total_km_walked: team[i].buddy_total_km_walked
    }
    team[i] = pokemon;
  }
  return team;
}

/**
* Stores pokemon fetched from Niantic into the local database
* @param Trainer {trainerObj}
* @param Pokemon[] team, array of Pokemons.Pokemon child objects
*/
function storePokemonTeam(trainerObj, team) {
  team = parsePokemonTeam(team);
  pokemonRepo.findPokemonTeam(trainerObj.username, function(error, oldTeam) {
    if (error) {return callback(error);}
    else if (oldTeam) {
      pokemonRepo.updatePokemonTeam(trainerObj.username, team, function(error, newTeam) {});
    } else {
      pokemonRepo.createPokemonTeam(trainerObj.username, team, function(error, newTeam) {})
    }
  });
}

/**
* Stores items fetched from Niantic in the local database
* @param Trainer {trainerObj}
* @param Item[] items , array of Inventory.Item child objects
*/
function storeInventoryItems(trainerObj, items) {
  inventoryRepo.findInventory(trainerObj.username, function(error, oldInventory) {
    if (oldInventory) {
      inventoryRepo.updateInventory(trainerObj.username, items, function(error, newInventory) {});
    } else {
      inventoryRepo.createInventory(trainerObj.username, items, function(error, newInventory){});
    }
  })
}

/**
* Stores a pokedex fetched from Niantic in the local database
* @param Trainer {trainerObj}
* @param PokedexEntry[] {pokedex} , array of Pokedex.PokedexEntry child objects
*/
function storePokedex(trainerObj, pokedex) {
  pokedexRepo.findPokedex(trainerObj.username, function(error, oldPokedex) {
    if (error) return;
    if (oldPokedex)
      pokedexRepo.updatePokedex(trainerObj.username, pokedex, function(error, newPokedex) {});
    else
      pokedexRepo.createPokedex(trainerObj.username, pokedex, function(error, newPokedex) {});
  });
}

/**
* Stores candies fetched from Niantic in the local database
* @param Trainer {trainerObj}
* @param Candy[] {candies} , array of Candies.Candy child objects
*/
function storeCandy(trainerObj, candies) {
  candyRepo.findCandies(trainerObj.username, function(error, oldCandies) {
    if (error) return;
    else if (oldCandies)
      candyRepo.updateCandies(trainerObj.username, candies, function(error, newCandies) {});
    else
      candyRepo.createCandies(trainerObj.username, candies, function(error, newCandies) {});
  })
}

/**
* Stores a statistics object into the designated Trainer object
*
*/
function storeStatistics(trainerObj, statistics) {
  statistics.pokemon_caught_by_type = undefined;
  trainerRepo.getTrainer(trainerObj.username, function(error, oldTrainerObj) {
    if (error) return;
    else if (oldTrainerObj)
      trainerRepo.updateStatistics(oldTrainerObj.username, statistics, function(error, newTrainerObj) {});
    else return; // Don't store the statistics anywhere as there's no trainer
  });
}

/**
* Fetches a Trainer's badges from the Niantic servers and stores them locally.
* @param Trainer {trainerObj} , required for authentication.
* @param callback(error, obj) , return function.
* @return callback(Error error, Badges badgesObj)
*/
function fetchProfile(trainerObj, callback) {
  var requestType = new CustomAPI.RequestNetwork.Request(121);
  CustomAPI.api_req(trainerObj, requestType, function apiCallback(error, badges) {
    if (error) {
      return callback(error);
    } else if (!badges) {
      return callback(new Error('No badges received.'));
    } else {
      console.log('[i] Badges fetched!');
      return callback(null, badges);
    }
  }, CustomAPI.ResponseNetwork.GetPlayerProfileResponse);
}

/**
* Fetches Trainer data from the Niantic servers. This request is mandatory for
* obtaining a Trainer's username and therefor has priority over other requests.
* @param Trainer {trainerObj} , required for authentication.
* @param callback(error, obj) , return function.
* @return callback(Error error, Trainer trainerObj)
*/
function fetchTrainerData(trainerObj, callback) {
  var requestType = new CustomAPI.RequestNetwork.Request(2);
  CustomAPI.api_req(trainerObj, requestType, function(error, statistics) {
    if (error) {
      return callback(error);
    } else if (!statistics) {
      return callback(new Error('No statistics received.'));
    } else {
      return callback(null, statistics.player_data);
    }
  },CustomAPI.ResponseNetwork.GetPlayerResponse);
}

/**
* Fetches Trainer inventory from the Niantic servers.
* @param Trainer {trainerObj} , required for authentication.
* @param callback(error, inventory) , return function.
* @return callback(Error error, Inventory inventory)
*/
function fetchInventory(trainerObj, callback) {
  var requestType = new CustomAPI.RequestNetwork.Request(4);
  CustomAPI.api_req(trainerObj, requestType, function(error, inventory) {
    if (error) {
      return callback(error);
    } else if (!inventory) {
      return callback(new Error('No inventory received.'));
    }

    // parseInventory();

    return callback(null, inventory);
  }, CustomAPI.ResponseNetwork.GetInventoryResponse);
}

/**
* Updates an existing Trainer object in the database based on Trainer.username
* @param Trainer {trainerObj} , gets stored into the database
* @param function callback(error, trainerObj) , return function
* @return callback(Error error, Trainer newTrainerObj)
*/
function updateTrainer(trainerObj, callback) {
  trainerRepo.updateTrainer(trainerObj, function(error, newTrainer) {
    if (error) {callback(error, null); return;}
    callback(null, newTrainer);
  });
}

/**
* Creates a new Trainer object in the database
* @param Trainer {trainerObj} , gets stored into the database
* @param function callback(error, trainerObj) , return function
* @return callback(Error error, Trainer newTrainerObj)
*/
function createTrainer(trainerObj, callback) {
  trainerRepo.createTrainer(trainerObj, function(error, newTrainer) {
    if (error) {return callback(error);}
    return callback(null, newTrainer);
  });
}

/**
* Fetches an endpoint for future requests from the Niantic servers
* @param Trainer {trainerObj}
* @param Function callback(error, data), post login & error handling function
* @return Function callback(Error error, Trainer trainerObj), execution
*/
function getApiEndpoint(trainerObj, callback) {
  var req = [
    new CustomAPI.RequestNetwork.Request(2),
    new CustomAPI.RequestNetwork.Request(126),
    new CustomAPI.RequestNetwork.Request(4),
    new CustomAPI.RequestNetwork.Request(129),
    new CustomAPI.RequestNetwork.Request(5)
  ];

  CustomAPI.api_req(trainerObj, req, function (error, response) {
    if (error) {
      return callback(error, null);
    }

    if (response.api_url) {
      var api_endpoint = "https://" + response.api_url + "/rpc";
      trainerObj.login.apiEndpoint = api_endpoint;
      console.log("[!] ApiEndpoint received! : "+api_endpoint);
      return callback(null, trainerObj);
    } else {
      return callback(new Error('No api url received!'));
    }
  });
}

/**
* Log in on the Niantic servers using a PTC account
* Fetch unique login identification using initial handshake request
* @param Object {credentials} , String username, String password, String provider, Float latitude, Float longitude, Float accuracy
* @param callback(Error error, Trainer trainerObj) , return function.
* @return callback(Error error, Trainer trainerObj) , error and response handler
*/
function pokemonClub(credentials, callback) {
 var options = {
   url: config.LOGIN_URL,
   headers: config.REQ_HEADERS
 };

 request.get(options, function(err, response, body) {
   if (err) {return callback(err);}
   var data;
   // FIXME This fucks up after logging in for a second time.
   // Check if we need to logout externally from Niantic's servers
   // Detect if this is valid JSON
   if (/^[\],:{}\s]*$/.test(body.replace(/\\["\\\/bfnrtu]/g, '@').
   replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
   replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
     data = JSON.parse(body);
   } else {
     return callback(new Error('Response was not valid JSON. Restart the server.'))
   }
   console.log('[i] First request successful.');
   ptcHandshakeCallback(data, credentials, callback);
 });
}

/**
* Logs into the Google server to obtain a master key which in return works as
* a token for the Niantic API server.
* CAUTION: DOES NOT WORK WITH TWO-FACTOR AUTHENTICATION. Requires a Google ASP
* ASPs can be generated here : https://security.google.com/settings/security/apppasswords
* @param Object {credentials} , String Gmail, String password, String provider, Float latitude, Float longitude, Float accuracy
* @param callback(Error error, Trainer trainerObj) , return function.
* @return callback(Error error, Trainer trainerObj) , error and response handler
*/
function googleOAuth(credentials, callback) {
  var authObjects = {
    ticket : undefined,
    token : undefined,
    endpoint : undefined
  }
  google.login(credentials.username, credentials.password, config.ANDROID_ID, function(error, data) {
    if (error) {
      console.log(('[!] Error logging into Google services').red)
      return callback(error);
    } else if (data) {
      google.oauth(credentials.username, data.masterToken, data.androidId, config.OAUTH_SERVICE, config.APP, config.CLIENT_SIG, function(error, data) {
        if (error) {
          console.log(('[!] Error retrieving oauth data from Google services').red)
          return callback(error);
        }
        console.log('[i] Google login succesfull');
        authObjects.token = data.Auth;
        postTokenCallback(authObjects, credentials, callback);
      })
    }
  });
}

/**
* Logout a user locally. This deletes the login details from the database.
* login,accessToken & login.apiEndpoint are ereased.
* TODO Research whether a user should also logout externally (Niantic)
* @param String username , unique identifier
* @param Function callback(error, trainer)
* @return callback(Error error, Trainer trainer) , logged out Trainer with ereased login details
*/
function logout(username, callback) {
  if (!username) return callback(new Error('No username supplied'));
  getAvailableTrainers(username, function(error, trainer) {
    if (error) {
      console.log('[!] Error logging out user '+username);
      return callback(error);
    } else if (trainer) {
      trainer.login.accessToken = null;
      trainer.login.apiEndpoint = null;
      updateTrainer(trainer, function(error, newTrainer) {
        if (error) console.log('[!] Error logging out user '+username);
        else if (newTrainer) console.log('[i] User logged out : '+username);
        return callback(error, newTrainer);
      });
    } else {
      return callback(new Error('User '+username+' was not logged in'))
    }
  })
}

/**
* Fetches one or more users from the local database
* @param String username. Optional, if NULL then return all trainers.
* @param Function callback(error, trainers)
* @return callback(Error error, Trainer[] trainers) , array of Trainer objects.
*/
function getTrainer(username, callback) {
  trainerRepo.getTrainer(username, callback);
}

/**
* Retuns all locally stored trainers that contain authentication data.
* This indicates that they have been logged in since the laest server startup.
* @param String username , lookup ID
* @param callback(Error error, Trainer[] trainers)
* @return callback(Error error, Trainer[] trainers)
*/
function getAvailableTrainers(username, callback) {
  trainerRepo.getOnlineTrainers(username, callback);
}

/**
* Fetches a trainer's badges from the local database
* @param String username
* @param Function callback(error, badges)
* @return callback(Error error, Badges badgs)
*/
function getProfile(username, callback) {
  badgeRepo.findByUsername(username, callback);
}

function getInventory(username, callback) {
  inventoryRepo.findInventory(username, callback)
}

/**
* Fetches a trainer's pokemon team from the local database
* @param String username
* @param Function callback(error, pokemons)
* @return callback(Error error, Pokemons pokemons)
*/
function getPokemonTeam(username, callback) {
  pokemonRepo.findPokemonTeam(username, callback);
}

function getPokedex(username, callback) {
  pokedexRepo.findPokedex(username, callback);
}

function getStatistics(username, callback) {
  return callback(null, null);
}

/**
* Fetches a trainer's candies team from the local database
* @param String username
* @param Function callback(error, candies)
* @return callback(Error error, Candies candies)
*/
function getCandies(username, callback) {
  candyRepo.findCandies(username, callback);
}

// Exports
module.exports = {
  pokemonClub : pokemonClub,
  googleOAuth : googleOAuth,
  logout : logout,
  getTrainer : getTrainer,
  getAvailableTrainers : getAvailableTrainers,
  getProfile : getProfile,
  getInventory : getInventory,
  getPokemonTeam : getPokemonTeam,
  getPokedex : getPokedex,
  getStatistics : getStatistics,
  getCandies : getCandies
}
