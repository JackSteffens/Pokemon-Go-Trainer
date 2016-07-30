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

// Routing : API
// GET : all todos
app.get('/api/todos', function(req, res) {
  Todo.find(function(error, todos) {
    if (error) res.send(error); // Return error response

    res.json(todos); // Return found Todos as JSON
  })
});

// POST : create new todo
app.post('/api/todos', function(req, res) {
  console.log(req);
  Todo.create({
    text : req.body.text
  }, function(error, todo) {
    if (error) res.send(error); // Return error response

    Todo.find(function(error, todos) {
      if (error) res.send(error); // Return error response

      res.json(todos); // Return all Todos after a new one was created
    });
  });
});

// DELETE : delete a todo
app.delete('/api/todos/:todo_id', function(req, res) {
  Todo.remove({
    _id : req.params.todo_id
  }, function (error, todo) {
      if (error) res.send(error); // Return error response

      Todo.find(function(error, todos) {
        if (error) res.send(error); // Return error response

        res.json(todos); // Return all Todos after one was deleted
      });
  });
});

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
      latitude: parseFloat(req.body.lat),
      longitude: parseFloat(req.body.lng),
      altitude: parseFloat(req.body.alt)
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

        // TODO Place this in a seperate method.
        Trainer.find({username: statistics.username}, function(error, trainer) {
          // If found, don't allow dupes. Else, insert new.
          // TODO : There's also currency and avatar data available.
          if (trainer) {
            Trainer.update(
              {username:statistics.username},
              {accessToken: trainerObj.token,
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
              {runValidators:true},
              function(error, obj) {
                if (error) {res.status('409'); res.send(error); return;}
                console.log('[i] Updated trainer : '+statistics.username);
                Trainer.find({username:statistics.username}, function(error, trainer) {
                  res.json(trainer);
                  return;
                })
                return;
              });
          } else {
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
              if (error) {res.status('500'); res.send(error); return;}
              res.send(trainerProfile);
              return;
            }); // Trainer.create()
          }
        }); // Trainer.find()
      }); // getTrainerData()
    }); // getApiEndpoint()
  }); // pokemonClub()
}); // request.post()

/**
* GET : Get access token after signed in successfully
*/
app.get('api/trainer/accesstoken', function(req, res) {
  res.send(getAccessToken());
});

// Get access token from PoGo servers
function getAccessToken(username, password) {

}

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
