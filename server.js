'use strict';

// Dependencies
var express = require('express');         // Server
var mongoose = require('mongoose');       // Database
var morgan = require('morgan');           // Console logging
var bodyParser = require('body-parser');  // ?? request parser ??
var request = require('request');         // HTTP requests
var fs = require('fs');                   // FileStream
var CustomAPI = require('./CustomAPI.js');// API

// Configuration
var app = express();
var self = this;
var MAPS_API_KEY = "AIzaSyCZ529cNRU0_SzymFdsYXtOW_Bf9uHDfaE";
var LOGIN_URL = "https://sso.pokemon.com/sso/login?service=https%3A%2F%2Fsso.pokemon.com%2Fsso%2Foauth2.0%2FcallbackAuthorize";
var LOGIN_OAUTH = "https://sso.pokemon.com/sso/oauth2.0/accessToken";
mongoose.connect('mongodb://localhost:27017/pogobot'); // Connect to DB

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended' : 'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type : 'application/vnd.api+json'}));

// Models
var Pokemon = require(__dirname+'/models/js/pokemon.model.js').Pokemon;
var Trainer = require(__dirname+'/models/js/trainer.model.js').Trainer;
// Logged in users are temporary stored in this array for future requests.
var availableUsers = [];

// Routing : API
// GET : Complete Pokedexs
app.get('/api/pokedex', function(req, res) {
  res.sendFile(__dirname+'/models/json/pokedex.model.json')
});

// GET : Scanned pokemon
app.get('/api/nearby/pokemon', function(req, res) {
  res.sendFile(__dirname+'/models/json/scanned_pokemon.json');
});

// GET : Scanned pokemon from external scanner
app.get('/api/nearby/pokemon/ext', function(req, res) {
  request.get('http://localhost:5000/raw_data', function(err, response, body){
    res.json(body);
  })
});

/**
* POST : Store pokemon in inventory
*/
app.post('/api/pokemon/create', function(req, res) {
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
});

/**
* GET : Request path from Google Maps API
* Return : [DirectionsResult] object containing a path using coordinates
*/
app.get('/api/map/path', function(req, res) {
var oLat = req.query.originlat,
    oLng = req.query.originlng,
    dLat = req.query.destlat,
    dLng = req.query.destlng,
    trvlMode = req.query.mode;

    if (trvlMode == undefined) {
      trvlMode = "bicycling";
    }

  if (oLat && oLng && dLat && dLng) {
    var base = "https://maps.googleapis.com/maps/api/directions/json?"
    var url = base+"origin="+oLat+","+oLng+"&destination="+dLat+","+dLng+"&key="+MAPS_API_KEY;
    if (trvlMode) {
      url = url+"&mode="+trvlMode;
    }
    console.log(url);
    request.get(url, function(err, response, body){
      res.json(body);
    });
  } else {
    res.status(400);
    res.send("Please supply both latitude and longitude values for both origin and destination [originlat, originlng, destlat, destlng]")
  }
});


/**
* POST : Send user location to PoGo's server
* Return : nearby pokestops, pokemon, gyms
*/
app.post('/api/travel', function(req, res) {
  // Implement PoGo API
});

/**
* GET : All stored trainer accounts
* Returns : Trainer model objects
*/
app.get('/api/trainer', function(req, res) {
  Trainer.find({}, function(error, trainers) {
    if (error) {res.status('404'); res.send(error); return;}

    res.json(trainers);
  })
});

/**
* POST : Login using PTC credentials
* Returns Pokemon Go profile :
*   creation date, username, team, avatar, poke & inv available storage,
*   daily bonus ??, pokecoins & stardust.
*/
app.post('/api/trainer/login/ptc', function(req, res) {
  // var trainer = new PokemonGO.Pokeio();
  var username = req.body.username;
  var password = req.body.password;
  var provider = "ptc";

  if (username == undefined || password == undefined) {
    res.status('400');
    res.send('Both a username and password are required');
  }

  console.log('[i] Logging in as : '+username);
  // console.log(CustomAPI);
  CustomAPI.pokemonClub(username, password, function(err, authObjects) {
    if (err) {
      console.log("[!] Error : "+err);
      res.status('400');
      res.send(err);
      return;
    }

    var trainerObj = {
      provider: provider,
      ticket: authObjects.ticket,
      token: authObjects.token,
      apiEndpoint: undefined,
      username: undefined, // Not your login username, but in-game one.
      latitude: parseFloat(req.body.latitude),
      longitude: parseFloat(req.body.longitude),
      altitude: parseFloat(req.body.altitude)
    }

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
        Trainer.find({username: statistics.username}, function(error, trainer) {
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
                console.log('[i] Updated trainer : '+statistics.username);
                Trainer.find({username:statistics.username}, function(error, trainer) {
                  res.json(trainer);
                  return;
                })
                return;
              });
          } else {
            // Creating a new trainer
            Trainer.create({
              login: {
                type: provider,
                username: username,
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
            }, function(error, trainerProfile) {
              if (error) {
                res.status('500');
                res.send(error);
                console.log('[!] Error creating trainer')
                return;
              }

              res.send(trainerProfile);
              return;
            }); // Trainer.create()
          }   // if (trainer) else
        }); // Trainer.find()
      }); // getTrainerData()
    }); // getApiEndpoint()
  }); // pokemonClub()
}); // request.post()

/**
* GET : Get trainer inventory
* Params : username (String) (in-game username)
* Returns : Medals, levels and other junk
*/
app.get('/api/trainer/inventory', function(req, res) {
  console.log('Requesting data for user : '+req.query.username);
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
    // inventory_delta.inventory_items[1].inventory_item_data.player_stats = levels, exp and certain badges
    // inventory_delta.inventory_items[2].inventory_item_data.candy = candies
    // inventory_delta.inventory_items[3].inventory_item_data.egg_incubator[x] = egg incubators
    // inventory_delta.inventory_items[4].inventory_item_data.pokedex_entry = pokedex stats
    // inventory_delta.inventory_items[5].inventory_item_data.item = items (insense was listed)
    // inventory_delta.inventory_items[6].inventory_item_data.item = more items?? Incubators again??
    // inventory_delta.inventory_items[7].inventory_item_data.pokemon_data = pokemon party


    // Trainer.update(
    //   {username:trainerObj.username},
    //   {});

    console.log(inventoryObj)
    res.send(inventoryObj);
    return;
  })
});

// Scrape images from serebii
// app.get('/api/pokedex/images', function(req, res) {
//   var pokedex = JSON.parse(fs.readFileSync(__dirname+'/models/pokemons.json', 'utf8'));
//   for (var index in pokedex.pokemon) {
//     var name = (parseInt(index)+1);
//     name = name.toString().length < 2 ? "0"+name : name;
//     name = name.toString().length < 3 ? "0"+name : name;
//     getImages(pokedex.pokemon[index].img, name+'.png', function() {console.log('success')})
//   }
//   res.send("ok");
// });

// Store images in file system via stream
function getImages(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
}

// GET : Web application
app.get('/', function(req, res) {
  res.sendFile(__dirname+'/public/res/views/index.html');
})

// Open server
app.on('listening', function () {
  console.log('Clear database trainer keys');
});

app.listen(3000);
console.log("Server starting on port 3000");
