// Dependencies
var config = require(__dirname+"/../config.js");
var request = require('request');
var CustomAPI = require('../CustomAPI.js');

// Models
var Pokemon = require('../models/js/pokemon.model.js').Pokemon;
var Trainer = require('../models/js/trainer.model.js').Trainer;

// Logged in users are temporary stored in this array for future requests.
var availableUsers = [];

request = request.defaults({jar: request.jar()}); // For some reason this is required to log in.

/**
* Get known trainers from database. If a username is given then only return
* that specific trainer oject.
* @param (optional) String username
* @return [{Trainer}]
*/
exports.getTrainer = function(req, res) {
  // TODO if (req.param.username) {find & return trainer with username}
  Trainer.find({}, function(error, trainers) {
    if (error) {res.status('404'); res.send(error); return;}

    res.json(trainers);
  })
};

/**
* Get trainer profile from Niantic server
* @param String username
* @return {Medals, Levels, something}
*/
exports.getProfile = function(req, res) {
  console.log('[!] Requesting profile for user : '+req.query.username);
  var trainerObj = availableUsers[req.query.username];
  console.log(trainerObj);

  if (!trainerObj) {
    console.log('[!] This user is not currently logged in!');
    res.status('400');
    res.send('Not logged in');
    return;
  }

  CustomAPI.getTrainerProfile(trainerObj, function(error, profileObj) {
    if (error) {
      res.status('400');
      res.send('error');
      console.log('[#] '+error);
      return;
    }

    // Update trainer

    console.log(profileObj);
    res.send(profileObj);
    return;
  })
};

/**
* GET : Get trainer inventory
* @param : username (String) (in-game username)
* @return {Inventory}
*/
exports.getInventory = function(req, res) {
  console.log('[!] Requesting inventory for user : '+req.query.username);
  var trainerObj = availableUsers[req.query.username];
  console.log(trainerObj);

  if (!trainerObj) {
    console.log('[!] This user is not currently logged in!');
    res.status('400');
    res.send('Not logged in');
    return;
  }

  CustomAPI.getTrainerInventory(trainerObj, function(error, inventoryObj) {
    if (error) {res.status('400'); res.send(error); return}

    console.log('[i] Sucessfully retrieved trainer inventory')

    // Trainer.update(
    //   {username:trainerObj.username},
    //   {});

    console.log(inventoryObj);
    res.send(inventoryObj);
    return;
  })
};

/**
* Request an API token from the Niantic Server, stores a trainer object
* in the database and adds it to the local trainer array 'availaleUsers'.
* @param String username, req.body.username
* @param String password, req.body.password
* @param String provider, req.body.provider : "ptc" || "google"
* @return {}
*/
exports.login = function(req, res) {
  // var trainer = new PokemonGO.Pokeio();
  var username = req.body.username;
  var password = req.body.password;
  var provider = req.body.provider;

  if (username == undefined || password == undefined) {
    res.status('400');
    res.send('Both a username and password are required');
  }

  if (req.body.provider === 'ptc'){
    console.log('[i] Logging in as : '+username+' on Pokémon Trading club');
    CustomAPI.pokemonClub(username, password, function(err, authObjects) {
      if (err) {
        console.log("[!] Error : "+err);
        res.status('400');
        res.send(err);
        return;
      }
      postLogin(authObjects, req, res);
      return;
    }); // pokemonClub()
  } else if (req.body.provider === 'google') {
    console.log('[i] Logging in as : '+username+' on Google');
    CustomAPI.googleOAuth(username, password, function (err, authObjects) {
      if (err) {
        console.log("[!] Error : "+err);
        res.status('400');
        try {
          res.send(err);
        } catch (e) {
          res.send("Error logging into Google services");
        }
        return;
      }
      console.log(authObjects);
      postLogin(authObjects, req, res);
      return;
    })
  } else {
    res.status('400');
    res.send('[#] No valid provider provided');
    return;
  }
};

/**
* Deletes the API token from the database and removes the trainer object
* from the 'available' array.
* @return {}
*/
exports.logout = function(req, res) {
  var username = (req.body.username || req.query.username);
  if (!username) {
    console.log('[#] No username supplied.');
    res.status('400');
    res.send('No username supplied');
    return;
  }

  var trainerObj = availableUsers[username];

  if (!trainerObj) {
    console.log('[#] User '+username+' was not logged in or does not exist.')
    res.status('404');
    res.send('User not found. User was not logged in or does not exist.')
    return;
  }

  console.log(trainerObj);
  delete availableUsers[username];
  console.log(availableUsers)

  // update trainerObj to lose it's ticket, token and endpoint
  // remove trainer from availaleUsers
};

/**
* Adds a pokemon to the pokemon inventory database
* If the same pokemon already exists, then update the object.
* @param String username
* @param {Pokemon}
* @return
*/
exports.createPokemon = function(req, res) {
  console.log('Checking if pokemon exists in inventory')
  Pokemon.find({trainer: 'Hypnoised', creationTime: 8}, function(error, pokemon) {
    // If found, don't allow dupes. Else, insert new.
    if (pokemon) {
      console.log("Pokemon already exists");
      // Check if stats need to be updated (CP, HP, etc)
      res.status("409");
      res.send("Pokemon already exists in trainer's inventory");
    } else {
      // Add pokemon to trainer's inventory
      console.log("creating new");
      Pokemon.create({
          trainer: req.body.trainer,          // Ingame username
          pokedexId: req.body.pokedexId,      // 001, 002
          cp: req.body.cp,                    // Combat Power (level)
          stamina: req.body.stamina,          // Current HP
          maxStamina: req.body.maxStamina,    // Max HP
          move1: req.body.move1,              // Attack move 1
          move2: req.body.move2,              // Attack move 2
          height: req.body.height,            // Height in meters
          weight: req.body.weight,            // Weight in kilograms
          iAttack: req.body.iAttack,          // ?? Attack points  ??
          iDefense: req.body.iDefense,        // ?? Defense points ??
          iStamina: req.body.iStamina,        // ?? Stamina points ??
          cpMultiplier: req.body.cpMultiplier,// Multiplier when evolving
          pokeball: req.body.pokeball,        // Type of pokeball caught in
          capturedS2CellId: req.body.capturedS2CellId, // ?? Spawn location ??
          creationTime: req.body.creationTime // Date obtained in ms (egg only ??)
      }, function(error, pokemon) {
        if (error) {res.status("400"); res.send(error);} // Return error response
        res.json(pokemon); // If no errors, return newly created Pokemon entry.
      });
    }
  });
};

/**
* Get pokemon by trainer username and pokemon ID ??
* @return {Pokemon}
*/
exports.getPokemon = function(req, res) {
 // TODO Implement
};

/**
* After being logged into the Niantic user server we request an API server
* endpoint, fetch our Trainer from Niantic and store it in our local database.
* @param authObjects {String ticket, String token}
* @param Float req.body.latitude
* @param Float req.body.longitude
* @param Float req.body.altitude
* Returns : trainer (Object, Trainer.model) (via Request.response).
*/
function postLogin(authObjects, req, res) {
      var trainerObj = {
        provider: (req.body.provider).toString(),
        ticket: authObjects.ticket,
        token: authObjects.token,
        apiEndpoint: undefined,
        username: undefined, // Not your login username, but in-game one.
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude),
        altitude: parseFloat(req.body.altitude)
      }

      console.log('login()')
      console.log(trainerObj);

      CustomAPI.getApiEndpoint(trainerObj, function(error, trainerObj) {
        if (error) {
          console.log("[!] "+error);
          res.status('400');
          res.send(error);
          return;
        }

        CustomAPI.getTrainerData(trainerObj, function(error, statistics) {
          if (error) {res.status('400'); res.send(error); return;}

          trainerObj.username = statistics.username;
          availableUsers[trainerObj.username] = trainerObj;
          console.log(availableUsers)

          // TODO Place this in a seperate method.
          Trainer.findOne({username: statistics.username}, function(error, trainer) {
            // If found, don't allow dupes. Else, insert new.
            // TODO : There's also currency and avatar data available.
            if (trainer) {
              Trainer.update(
                {username:statistics.username},       // Where username = username
                {accessToken: trainerObj.token,       // Update values
                 apiEndpoint: trainerObj.apiEndpoint,
                 location: {
                   latitude: trainerObj.latitude,
                   longitude: trainerObj.longitude,
                 altitude: trainerObj.altitude
                 },
                 currency: {
                   pokecoin: statistics.currencies[0].amount,
                   stardust: statistics.currencies[1].amount,
                 }
                },
                {runValidators:true},                 // Update options
                function(error, obj) {                // Callback function
                  if (error) {
                    res.status('409');
                    res.send(error);
                    console.log('[!] Error updating trainer')
                    return;
                  }
                  console.log('[i] Updated existing trainer : '+statistics.username);
                  Trainer.findOne({username:statistics.username}, function(error, trainer) {
                    res.json(trainer);
                    return;
                  })
                  return;
                });
            } else {
              // Creating a new trainer
              Trainer.create({
                login: {
                  type: trainerObj.provider,
                  username: req.body.username,
                  accessToken: trainerObj.token,
                  apiEndpoint: trainerObj.apiEndpoint
                },
                location: {
                  latitude: trainerObj.latitude,
                  longitude: trainerObj.longitude,
                  altitude: trainerObj.altitude
                },
                username: statistics.username,
                team: statistics.team,
                avatar: {
                  skin: statistics.avatar.skin,
                  hair: statistics.avatar.hair,
                  shirt: statistics.avatar.shirt,
                  pants: statistics.avatar.pants,
                  hat: statistics.avatar.hat,
                  shoes: statistics.avatar.shoes,
                  gender: statistics.avatar.gender,
                  eyes: statistics.avatar.eyes,
                  backpack: statistics.avatar.backpack
                },
                currency: {
                  pokecoin: statistics.currencies[0].amount,
                  stardust: statistics.currencies[1].amount
                }
              }, function(error, obj) { // Callback function
                if (error) {
                  res.status('409');
                  res.send(error);
                  console.log('[!] Error updating trainer')
                  return;
                }
                console.log('[i] Created new trainer : '+statistics.username);
                Trainer.findOne({username:statistics.username}, function(error, trainer) {
                  if (error) {res.status('404'); res.send('[#] Something went wrong creating a new trainer'); return;}
                  res.json(trainer);
                  return;
                })
                return;
              }); // Trainer.create()
            }   // if (trainer) else
          }); // Trainer.find()
        }); // getTrainerData()
      }); // getApiEndpoint()
} // postLogin()
