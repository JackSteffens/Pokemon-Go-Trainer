// Dependencies
var config = require("../config.js");
var trainerService = require('../services/trainer.service.js');

/**
* Get all known trainers from database. If a username is given then only return
* that specific trainer oject.
* @param (optional) String username
* @return [{Trainer}]
*/
exports.getTrainer = function(req, res) {
  trainerService.getAvailableTrainers(null, function(error, trainers) {
    if (error) {
      res.status('400');
      res.send(err);
      return;
    }
    res.send(trainers);
    return;
  })
};

/**
* Get logged in trainers from database. If a username is given then only return
* that specific trainer object.
*/
exports.getAvailableTrainers = function(req, res) {
  trainerService.getAvailableTrainers(null, function(trainers) {
    res.send(trainers);
  });
}

/**
* Get trainer profile from Niantic server
* @param String username
* @return {Medals, Levels, something}
*/
exports.getProfile = function(req, res) {
  console.log('[!] Requesting profile for user : '+req.query.username);
};

/**
* GET : Get trainer inventory
* @param : username (String) (in-game username)
* @return {Inventory}
*/
exports.getInventory = function(req, res) {
  console.log('[!] Requesting inventory for user : '+req.query.username);
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
  credentials = {
    username : req.body.username,
    password : req.body.password,
    provider : req.body.provider,
    latitude : parseFloat(req.body.latitude),
    longitude: parseFloat(req.body.longitude),
    altitude : parseFloat(req.body.altitude)
  }

  if (credentials.username == undefined || credentials.password == undefined) {
    res.status('400');
    res.send('Both a username and password are required');
  }

  if (credentials.provider === 'ptc') {
    console.log('[i] Logging in as : '+credentials.username+' on Pokémon Trading club');
    trainerService.pokemonClub(credentials, function(err, trainerObj) {
      if (err) {
        console.log("[!] Error : "+err);
        res.status('400');
        res.send(err);
        return;
      }
      res.send(trainerObj);
      return;
    });
  } else if (credentials.provider === 'google') {
    console.log('[i] Logging in as : '+credentials.username+' on Google');
    trainerService.googleOAuth(credentials, function (err, trainerObj) {
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
      res.send(trainerObj);
      return;
    })
  } else {
    res.status('400');
    res.send('[!] No valid provider provided');
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

  var trainerObj = trainerService.getAvailableTrainers(username);

  if (!trainerObj) {
    console.log('[#] User '+username+' was not logged in or does not exist.')
    res.status('404');
    res.send('User not found. User was not logged in or does not exist.')
    return;
  }

  console.log(trainerObj);
  // TODO This should happen upon logout. No need to call this function.
  // trainerService.deleteAvailableTrainer(username);
  // console.log(trainerService.getAvailableTrainers())

  // update trainerObj to lose it's ticket, token and endpoint
  // remove trainer from availaleUsers
};

/**
* Get pokemon by trainer username and pokemon ID ??
* @return {Pokemon}
*/
exports.getPokemon = function(req, res) {
 // TODO Implement
};
